const PaymentService = require('../services/paymentService');
const { connectDB, sql } = require('../config/database');

class PaymentController {
    constructor(websocketService) {
        this.paymentService = new PaymentService(websocketService);
    }

    // Ödeme oluştur
    createPayment = async (req, res) => {
        try {
            const paymentData = {
                ...req.body,
                userId: req.user.UserID
            };
            const payment = await this.paymentService.createPayment(paymentData);
            res.status(201).json(payment);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    };

    // İade oluştur
    createRefund = async (req, res) => {
        try {
            const refundData = {
                ...req.body,
                userId: req.user.UserID
            };
            const refund = await this.paymentService.createRefund(refundData);
            res.status(201).json(refund);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    };

    // Sipariş ödemelerini getir
    getOrderPayments = async (req, res) => {
        try {
            const { orderId } = req.params;
            const pool = await connectDB();
            
            const result = await pool.request()
                .input('orderId', sql.Int, orderId)
                .query(`
                    SELECT 
                        p.*,
                        u.Username as CreatedByUser,
                        JSON_QUERY((
                            SELECT *
                            FROM Refunds
                            WHERE PaymentID = p.PaymentID
                            FOR JSON PATH
                        )) as Refunds
                    FROM Payments p
                    JOIN Users u ON p.CreatedBy = u.UserID
                    WHERE p.OrderID = @orderId
                    ORDER BY p.CreatedAt DESC
                `);

            const payments = result.recordset.map(payment => ({
                ...payment,
                Refunds: JSON.parse(payment.Refunds || '[]')
            }));

            res.json(payments);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    };

    // İndirim kodu uygula
    applyDiscount = async (req, res) => {
        try {
            const { orderId } = req.params;
            const { code } = req.body;
            const pool = await connectDB();
            const transaction = new sql.Transaction(pool);
            await transaction.begin();

            try {
                // İndirim kodunu kontrol et
                const discountCheck = await transaction.request()
                    .input('code', sql.NVarChar, code)
                    .input('now', sql.DateTime, new Date())
                    .query(`
                        SELECT *
                        FROM Discounts
                        WHERE Code = @code
                        AND IsActive = 1
                        AND (StartDate IS NULL OR StartDate <= @now)
                        AND (EndDate IS NULL OR EndDate >= @now)
                        AND (MaxUsageCount IS NULL OR CurrentUsageCount < MaxUsageCount)
                    `);

                if (discountCheck.recordset.length === 0) {
                    throw new Error('Geçersiz veya süresi dolmuş indirim kodu');
                }

                const discount = discountCheck.recordset[0];

                // Siparişi kontrol et
                const orderCheck = await transaction.request()
                    .input('orderId', sql.Int, orderId)
                    .query(`
                        SELECT TotalAmount
                        FROM Orders
                        WHERE OrderID = @orderId
                        AND OrderStatus = 'Pending'
                    `);

                if (orderCheck.recordset.length === 0) {
                    throw new Error('Geçerli bir sipariş bulunamadı');
                }

                const order = orderCheck.recordset[0];

                // Minimum sipariş tutarını kontrol et
                if (order.TotalAmount < discount.MinimumOrderAmount) {
                    throw new Error(`Bu indirim kodu minimum ${discount.MinimumOrderAmount} TL'lik siparişlerde geçerlidir`);
                }

                // İndirim tutarını hesapla
                let discountAmount;
                if (discount.DiscountType === 'PERCENTAGE') {
                    discountAmount = (order.TotalAmount * discount.Value) / 100;
                } else {
                    discountAmount = discount.Value;
                }

                // İndirimi uygula
                await transaction.request()
                    .input('orderId', sql.Int, orderId)
                    .input('discountId', sql.Int, discount.DiscountID)
                    .input('discountAmount', sql.Decimal, discountAmount)
                    .query(`
                        INSERT INTO OrderDiscounts (OrderID, DiscountID, DiscountAmount)
                        VALUES (@orderId, @discountId, @discountAmount)
                    `);

                // Sipariş toplam tutarını güncelle
                await transaction.request()
                    .input('orderId', sql.Int, orderId)
                    .input('discountAmount', sql.Decimal, discountAmount)
                    .query(`
                        UPDATE Orders
                        SET TotalAmount = TotalAmount - @discountAmount
                        WHERE OrderID = @orderId
                    `);

                // İndirim kullanım sayısını artır
                await transaction.request()
                    .input('discountId', sql.Int, discount.DiscountID)
                    .query(`
                        UPDATE Discounts
                        SET CurrentUsageCount = CurrentUsageCount + 1
                        WHERE DiscountID = @discountId
                    `);

                await transaction.commit();

                res.json({
                    success: true,
                    discountAmount,
                    newTotal: order.TotalAmount - discountAmount
                });
            } catch (error) {
                await transaction.rollback();
                throw error;
            }
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
}

module.exports = PaymentController; 