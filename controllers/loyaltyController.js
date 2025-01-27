const { connectDB, sql } = require('../config/database');

const loyaltyController = {
    // Sadakat programı detaylarını getir
    getProgramDetails: async (req, res) => {
        try {
            const pool = await connectDB();
            const result = await pool.request()
                .query(`
                    SELECT *
                    FROM LoyaltyPrograms
                    ORDER BY CreatedAt DESC
                `);
            res.json(result.recordset[0]); // En son oluşturulan program
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Sadakat programını güncelle
    updateProgram: async (req, res) => {
        try {
            const {
                name,
                description,
                pointsPerPurchase,
                minPointsForReward
            } = req.body;

            const pool = await connectDB();
            const result = await pool.request()
                .input('name', sql.NVarChar, name)
                .input('description', sql.NVarChar, description)
                .input('pointsPerPurchase', sql.Decimal, pointsPerPurchase)
                .input('minPointsForReward', sql.Int, minPointsForReward)
                .query(`
                    INSERT INTO LoyaltyPrograms (
                        Name, Description, PointsPerPurchase, MinPointsForReward
                    )
                    OUTPUT INSERTED.*
                    VALUES (
                        @name, @description, @pointsPerPurchase, @minPointsForReward
                    )
                `);

            res.json(result.recordset[0]);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Müşteri puanlarını getir
    getCustomerPoints: async (req, res) => {
        try {
            const { customerId } = req.params;
            const pool = await connectDB();
            
            const result = await pool.request()
                .input('customerId', sql.Int, customerId)
                .query(`
                    SELECT 
                        cl.*,
                        u.Username,
                        u.Email,
                        JSON_QUERY((
                            SELECT TOP 10 *
                            FROM LoyaltyTransactions
                            WHERE CustomerID = cl.CustomerID
                            ORDER BY CreatedAt DESC
                            FOR JSON PATH
                        )) as RecentTransactions
                    FROM CustomerLoyalty cl
                    JOIN Users u ON cl.CustomerID = u.UserID
                    WHERE cl.CustomerID = @customerId
                `);

            if (result.recordset.length === 0) {
                return res.status(404).json({ message: 'Müşteri bulunamadı' });
            }

            const customerPoints = result.recordset[0];
            customerPoints.RecentTransactions = JSON.parse(customerPoints.RecentTransactions || '[]');

            res.json(customerPoints);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Puanları kullan/ödül al
    redeemPoints: async (req, res) => {
        try {
            const { customerId } = req.user;
            const { points, orderId } = req.body;

            const pool = await connectDB();
            const transaction = new sql.Transaction(pool);
            await transaction.begin();

            try {
                // Mevcut puanları kontrol et
                const checkPoints = await transaction.request()
                    .input('customerId', sql.Int, customerId)
                    .query(`
                        SELECT CurrentPoints
                        FROM CustomerLoyalty
                        WHERE CustomerID = @customerId
                    `);

                if (checkPoints.recordset.length === 0 || 
                    checkPoints.recordset[0].CurrentPoints < points) {
                    throw new Error('Yetersiz puan');
                }

                // Puanları güncelle
                await transaction.request()
                    .input('customerId', sql.Int, customerId)
                    .input('points', sql.Decimal, points)
                    .query(`
                        UPDATE CustomerLoyalty
                        SET CurrentPoints = CurrentPoints - @points,
                            TotalPointsSpent = TotalPointsSpent + @points,
                            UpdatedAt = GETDATE()
                        WHERE CustomerID = @customerId
                    `);

                // İşlem kaydı oluştur
                await transaction.request()
                    .input('customerId', sql.Int, customerId)
                    .input('points', sql.Decimal, points)
                    .input('orderId', sql.Int, orderId)
                    .query(`
                        INSERT INTO LoyaltyTransactions (
                            CustomerID, Points, TransactionType, OrderID
                        )
                        VALUES (
                            @customerId, @points, 'SPEND', @orderId
                        )
                    `);

                await transaction.commit();
                res.json({ message: 'Puanlar başarıyla kullanıldı' });
            } catch (error) {
                await transaction.rollback();
                throw error;
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = loyaltyController; 