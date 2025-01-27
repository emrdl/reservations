const { connectDB, sql } = require('../config/database');

const menuController = {
    // Tüm menüyü getir
    getFullMenu: async (req, res) => {
        try {
            const pool = await connectDB();
            const result = await pool.request()
                .query(`
                    SELECT 
                        p.*,
                        c.Name as CategoryName,
                        c.Description as CategoryDescription
                    FROM Products p
                    JOIN Categories c ON p.CategoryID = c.CategoryID
                    WHERE p.IsAvailable = 1
                    ORDER BY c.Name, p.Name
                `);
            res.json(result.recordset);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Kategoriye göre menü getir
    getMenuByCategory: async (req, res) => {
        try {
            const { categoryId } = req.params;
            const pool = await connectDB();
            const result = await pool.request()
                .input('categoryId', sql.Int, categoryId)
                .query(`
                    SELECT 
                        p.*,
                        c.Name as CategoryName,
                        c.Description as CategoryDescription
                    FROM Products p
                    JOIN Categories c ON p.CategoryID = c.CategoryID
                    WHERE p.CategoryID = @categoryId AND p.IsAvailable = 1
                    ORDER BY p.Name
                `);
            res.json(result.recordset);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Yeni menü ürünü ekle
    createMenuItem: async (req, res) => {
        try {
            const {
                categoryId,
                name,
                description,
                price,
                isAvailable = true
            } = req.body;

            const pool = await connectDB();
            const result = await pool.request()
                .input('categoryId', sql.Int, categoryId)
                .input('name', sql.NVarChar, name)
                .input('description', sql.NVarChar, description)
                .input('price', sql.Decimal, price)
                .input('isAvailable', sql.Bit, isAvailable)
                .query(`
                    INSERT INTO Products (
                        CategoryID, Name, Description, 
                        Price, IsAvailable
                    )
                    OUTPUT INSERTED.*
                    VALUES (
                        @categoryId, @name, @description,
                        @price, @isAvailable
                    )
                `);

            res.status(201).json(result.recordset[0]);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Menü ürünü güncelle
    updateMenuItem: async (req, res) => {
        try {
            const { id } = req.params;
            const {
                categoryId,
                name,
                description,
                price,
                isAvailable
            } = req.body;

            const pool = await connectDB();
            const result = await pool.request()
                .input('id', sql.Int, id)
                .input('categoryId', sql.Int, categoryId)
                .input('name', sql.NVarChar, name)
                .input('description', sql.NVarChar, description)
                .input('price', sql.Decimal, price)
                .input('isAvailable', sql.Bit, isAvailable)
                .query(`
                    UPDATE Products
                    SET CategoryID = @categoryId,
                        Name = @name,
                        Description = @description,
                        Price = @price,
                        IsAvailable = @isAvailable,
                        UpdatedAt = GETDATE()
                    OUTPUT INSERTED.*
                    WHERE ProductID = @id
                `);

            if (result.rowsAffected[0] === 0) {
                return res.status(404).json({ message: 'Ürün bulunamadı' });
            }

            res.json(result.recordset[0]);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Menü ürünü sil
    deleteMenuItem: async (req, res) => {
        try {
            const { id } = req.params;
            const pool = await connectDB();

            // Önce sipariş detaylarını kontrol et
            const checkOrders = await pool.request()
                .input('id', sql.Int, id)
                .query('SELECT COUNT(*) as count FROM OrderDetails WHERE ProductID = @id');

            if (checkOrders.recordset[0].count > 0) {
                // Ürün siparişlerde kullanılmışsa silme, sadece pasife al
                const result = await pool.request()
                    .input('id', sql.Int, id)
                    .query(`
                        UPDATE Products
                        SET IsAvailable = 0,
                            UpdatedAt = GETDATE()
                        WHERE ProductID = @id
                    `);

                if (result.rowsAffected[0] === 0) {
                    return res.status(404).json({ message: 'Ürün bulunamadı' });
                }

                return res.json({ message: 'Ürün pasife alındı' });
            }

            // Sipariş yoksa tamamen sil
            const result = await pool.request()
                .input('id', sql.Int, id)
                .query('DELETE FROM Products WHERE ProductID = @id');

            if (result.rowsAffected[0] === 0) {
                return res.status(404).json({ message: 'Ürün bulunamadı' });
            }

            res.json({ message: 'Ürün başarıyla silindi' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = menuController; 