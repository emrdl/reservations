const { connectDB, sql } = require('../config/database');

const customersController = {
    // Tüm müşterileri getir
    getAllCustomers: async (req, res) => {
        try {
            const pool = await connectDB();
            const result = await pool.request()
                .query(`
                    SELECT 
                        u.*,
                        cl.CurrentPoints,
                        cl.TotalPointsEarned,
                        cl.TotalPointsSpent,
                        (
                            SELECT COUNT(*)
                            FROM Orders o
                            WHERE o.UserID = u.UserID
                        ) as TotalOrders,
                        (
                            SELECT SUM(TotalAmount)
                            FROM Orders o
                            WHERE o.UserID = u.UserID
                        ) as TotalSpent
                    FROM Users u
                    LEFT JOIN CustomerLoyalty cl ON u.UserID = cl.CustomerID
                    WHERE u.Role = 'Customer'
                    ORDER BY u.CreatedAt DESC
                `);
            res.json(result.recordset);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Müşteri detaylarını getir
    getCustomerById: async (req, res) => {
        try {
            const { id } = req.params;
            const pool = await connectDB();
            
            // Müşteri bilgileri ve sadakat puanları
            const customerResult = await pool.request()
                .input('id', sql.Int, id)
                .query(`
                    SELECT 
                        u.*,
                        cl.CurrentPoints,
                        cl.TotalPointsEarned,
                        cl.TotalPointsSpent
                    FROM Users u
                    LEFT JOIN CustomerLoyalty cl ON u.UserID = cl.CustomerID
                    WHERE u.UserID = @id AND u.Role = 'Customer'
                `);

            if (customerResult.recordset.length === 0) {
                return res.status(404).json({ message: 'Müşteri bulunamadı' });
            }

            // Müşterinin son siparişleri
            const ordersResult = await pool.request()
                .input('id', sql.Int, id)
                .query(`
                    SELECT TOP 10
                        o.*,
                        t.TableNumber,
                        JSON_QUERY((
                            SELECT od.*, p.Name as ProductName
                            FROM OrderDetails od
                            JOIN Products p ON od.ProductID = p.ProductID
                            WHERE od.OrderID = o.OrderID
                            FOR JSON PATH
                        )) as OrderDetails
                    FROM Orders o
                    LEFT JOIN Tables t ON o.TableID = t.TableID
                    WHERE o.UserID = @id
                    ORDER BY o.CreatedAt DESC
                `);

            // Sadakat işlemleri geçmişi
            const loyaltyResult = await pool.request()
                .input('id', sql.Int, id)
                .query(`
                    SELECT TOP 10 *
                    FROM LoyaltyTransactions
                    WHERE CustomerID = @id
                    ORDER BY CreatedAt DESC
                `);

            const customer = {
                ...customerResult.recordset[0],
                recentOrders: ordersResult.recordset.map(order => ({
                    ...order,
                    OrderDetails: JSON.parse(order.OrderDetails || '[]')
                })),
                loyaltyHistory: loyaltyResult.recordset
            };

            res.json(customer);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Müşteri bilgilerini güncelle
    updateCustomer: async (req, res) => {
        try {
            const { id } = req.params;
            const { email, username } = req.body;

            const pool = await connectDB();
            
            // Email ve kullanıcı adı benzersizlik kontrolü
            const checkDuplicate = await pool.request()
                .input('id', sql.Int, id)
                .input('email', sql.NVarChar, email)
                .input('username', sql.NVarChar, username)
                .query(`
                    SELECT UserID, Email, Username 
                    FROM Users 
                    WHERE (Email = @email OR Username = @username) 
                    AND UserID != @id
                `);

            if (checkDuplicate.recordset.length > 0) {
                return res.status(400).json({ 
                    message: 'Bu email veya kullanıcı adı başka bir kullanıcı tarafından kullanılıyor' 
                });
            }

            const result = await pool.request()
                .input('id', sql.Int, id)
                .input('email', sql.NVarChar, email)
                .input('username', sql.NVarChar, username)
                .query(`
                    UPDATE Users
                    SET Email = @email,
                        Username = @username,
                        UpdatedAt = GETDATE()
                    OUTPUT INSERTED.*
                    WHERE UserID = @id AND Role = 'Customer'
                `);

            if (result.rowsAffected[0] === 0) {
                return res.status(404).json({ message: 'Müşteri bulunamadı' });
            }

            res.json(result.recordset[0]);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Müşteri sil
    deleteCustomer: async (req, res) => {
        try {
            const { id } = req.params;
            const pool = await connectDB();

            // Müşterinin siparişlerini kontrol et
            const checkOrders = await pool.request()
                .input('id', sql.Int, id)
                .query('SELECT COUNT(*) as count FROM Orders WHERE UserID = @id');

            if (checkOrders.recordset[0].count > 0) {
                return res.status(400).json({
                    message: 'Bu müşteriye ait siparişler bulunmaktadır. Silme işlemi yapılamaz.'
                });
            }

            // Transaction başlat
            const transaction = new sql.Transaction(pool);
            await transaction.begin();

            try {
                // Sadakat programı verilerini sil
                await transaction.request()
                    .input('id', sql.Int, id)
                    .query('DELETE FROM CustomerLoyalty WHERE CustomerID = @id');

                await transaction.request()
                    .input('id', sql.Int, id)
                    .query('DELETE FROM LoyaltyTransactions WHERE CustomerID = @id');

                // Kullanıcıyı sil
                const result = await transaction.request()
                    .input('id', sql.Int, id)
                    .query('DELETE FROM Users WHERE UserID = @id AND Role = \'Customer\'');

                if (result.rowsAffected[0] === 0) {
                    throw new Error('Müşteri bulunamadı');
                }

                await transaction.commit();
                res.json({ message: 'Müşteri başarıyla silindi' });
            } catch (error) {
                await transaction.rollback();
                throw error;
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = customersController; 