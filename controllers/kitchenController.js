const { connectDB, sql } = require('../config/database');

const kitchenController = {
    // Bekleyen siparişleri getir
    getPendingOrders: async (req, res) => {
        try {
            const pool = await connectDB();
            const result = await pool.request()
                .query(`
                    SELECT 
                        o.OrderID,
                        o.TableID,
                        t.TableNumber,
                        o.OrderStatus,
                        o.KitchenStatus,
                        o.KitchenNotes,
                        o.EstimatedPrepTime,
                        o.CreatedAt,
                        o.UpdatedAt,
                        JSON_QUERY((
                            SELECT od.*, p.Name as ProductName, p.Description as ProductDescription
                            FROM OrderDetails od
                            JOIN Products p ON od.ProductID = p.ProductID
                            WHERE od.OrderID = o.OrderID
                            FOR JSON PATH
                        )) as OrderDetails
                    FROM Orders o
                    JOIN Tables t ON o.TableID = t.TableID
                    WHERE o.KitchenStatus IN ('Pending', 'In Progress')
                    ORDER BY o.CreatedAt ASC
                `);
            
            // JSON stringi parse et
            const orders = result.recordset.map(order => ({
                ...order,
                OrderDetails: JSON.parse(order.OrderDetails || '[]')
            }));

            res.json(orders);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Sipariş durumunu güncelle
    updateOrderStatus: async (req, res) => {
        try {
            const { id } = req.params;
            const { kitchenStatus, kitchenNotes } = req.body;

            const pool = await connectDB();
            const result = await pool.request()
                .input('id', sql.Int, id)
                .input('kitchenStatus', sql.NVarChar, kitchenStatus)
                .input('kitchenNotes', sql.NVarChar, kitchenNotes)
                .query(`
                    UPDATE Orders
                    SET KitchenStatus = @kitchenStatus,
                        KitchenNotes = @kitchenNotes,
                        UpdatedAt = GETDATE()
                    OUTPUT INSERTED.*
                    WHERE OrderID = @id
                `);

            if (result.rowsAffected[0] === 0) {
                return res.status(404).json({ message: 'Sipariş bulunamadı' });
            }

            // Eğer sipariş tamamlandıysa, ana sipariş durumunu da güncelle
            if (kitchenStatus === 'Completed') {
                await pool.request()
                    .input('id', sql.Int, id)
                    .query(`
                        UPDATE Orders
                        SET OrderStatus = 'Ready'
                        WHERE OrderID = @id
                    `);
            }

            res.json(result.recordset[0]);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Hazırlama süresini güncelle
    updatePrepTime: async (req, res) => {
        try {
            const { id } = req.params;
            const { estimatedPrepTime } = req.body;

            const pool = await connectDB();
            const result = await pool.request()
                .input('id', sql.Int, id)
                .input('estimatedPrepTime', sql.Int, estimatedPrepTime)
                .query(`
                    UPDATE Orders
                    SET EstimatedPrepTime = @estimatedPrepTime,
                        UpdatedAt = GETDATE()
                    OUTPUT INSERTED.*
                    WHERE OrderID = @id
                `);

            if (result.rowsAffected[0] === 0) {
                return res.status(404).json({ message: 'Sipariş bulunamadı' });
            }

            res.json(result.recordset[0]);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = kitchenController; 