const PurchaseOrderService = require('../services/purchaseOrderService');
const { connectDB, sql } = require('../config/database');

class PurchaseOrderController {
    constructor(websocketService) {
        this.purchaseOrderService = new PurchaseOrderService(websocketService);
    }

    // Yeni satın alma siparişi oluştur
    createOrder = async (req, res) => {
        try {
            const orderData = {
                ...req.body,
                userId: req.user.UserID
            };
            const order = await this.purchaseOrderService.createPurchaseOrder(orderData);
            res.status(201).json(order);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    };

    // Siparişi teslim al
    receiveOrder = async (req, res) => {
        try {
            const { id } = req.params;
            const { items } = req.body;
            const userId = req.user.UserID;

            await this.purchaseOrderService.receivePurchaseOrder(id, items, userId);
            res.json({ success: true });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    };

    // Siparişleri listele
    getOrders = async (req, res) => {
        try {
            const { status, startDate, endDate, supplierId } = req.query;
            const pool = await connectDB();
            
            let query = `
                SELECT 
                    po.*,
                    s.Name as SupplierName,
                    u.Username as CreatedByUser,
                    JSON_QUERY((
                        SELECT *
                        FROM PurchaseOrderDetails pod
                        JOIN Ingredients i ON pod.IngredientID = i.IngredientID
                        WHERE pod.PurchaseOrderID = po.PurchaseOrderID
                        FOR JSON PATH
                    )) as Items
                FROM PurchaseOrders po
                JOIN Suppliers s ON po.SupplierID = s.SupplierID
                JOIN Users u ON po.CreatedBy = u.UserID
                WHERE 1=1
            `;

            const queryParams = [];
            if (status) {
                query += ` AND po.Status = @status`;
                queryParams.push({ name: 'status', value: status, type: sql.NVarChar });
            }
            if (startDate) {
                query += ` AND po.OrderDate >= @startDate`;
                queryParams.push({ name: 'startDate', value: new Date(startDate), type: sql.DateTime });
            }
            if (endDate) {
                query += ` AND po.OrderDate <= @endDate`;
                queryParams.push({ name: 'endDate', value: new Date(endDate), type: sql.DateTime });
            }
            if (supplierId) {
                query += ` AND po.SupplierID = @supplierId`;
                queryParams.push({ name: 'supplierId', value: supplierId, type: sql.Int });
            }

            query += ` ORDER BY po.OrderDate DESC`;

            const request = pool.request();
            queryParams.forEach(param => {
                request.input(param.name, param.type, param.value);
            });

            const result = await request.query(query);

            const orders = result.recordset.map(order => ({
                ...order,
                Items: JSON.parse(order.Items || '[]')
            }));

            res.json(orders);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    };
}

module.exports = PurchaseOrderController; 