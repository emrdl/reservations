const { connectDB, sql } = require('../config/database');

const categoriesController = {
    // Tüm kategorileri getir
    getAllCategories: async (req, res) => {
        try {
            const pool = await connectDB();
            const result = await pool.request()
                .query(`
                    SELECT c.*,
                           COUNT(p.ProductID) as ProductCount
                    FROM Categories c
                    LEFT JOIN Products p ON c.CategoryID = p.CategoryID
                    GROUP BY c.CategoryID, c.Name, c.Description
                    ORDER BY c.Name
                `);
            res.json(result.recordset);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Yeni kategori oluştur
    createCategory: async (req, res) => {
        try {
            const { name, description } = req.body;
            const pool = await connectDB();
            
            const result = await pool.request()
                .input('name', sql.NVarChar, name)
                .input('description', sql.NVarChar, description)
                .query(`
                    INSERT INTO Categories (Name, Description)
                    OUTPUT INSERTED.*
                    VALUES (@name, @description)
                `);

            res.status(201).json(result.recordset[0]);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Kategori güncelle
    updateCategory: async (req, res) => {
        try {
            const { id } = req.params;
            const { name, description } = req.body;

            const pool = await connectDB();
            const result = await pool.request()
                .input('id', sql.Int, id)
                .input('name', sql.NVarChar, name)
                .input('description', sql.NVarChar, description)
                .query(`
                    UPDATE Categories
                    SET Name = @name,
                        Description = @description
                    OUTPUT INSERTED.*
                    WHERE CategoryID = @id
                `);

            if (result.rowsAffected[0] === 0) {
                return res.status(404).json({ message: 'Kategori bulunamadı' });
            }

            res.json(result.recordset[0]);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Kategori sil
    deleteCategory: async (req, res) => {
        try {
            const { id } = req.params;
            const pool = await connectDB();

            // Önce kategoriye ait ürünleri kontrol et
            const checkProducts = await pool.request()
                .input('id', sql.Int, id)
                .query('SELECT COUNT(*) as count FROM Products WHERE CategoryID = @id');

            if (checkProducts.recordset[0].count > 0) {
                return res.status(400).json({
                    message: 'Bu kategoriye ait ürünler bulunmaktadır. Önce ürünleri silmelisiniz.'
                });
            }

            const result = await pool.request()
                .input('id', sql.Int, id)
                .query('DELETE FROM Categories WHERE CategoryID = @id');

            if (result.rowsAffected[0] === 0) {
                return res.status(404).json({ message: 'Kategori bulunamadı' });
            }

            res.json({ message: 'Kategori başarıyla silindi' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = categoriesController; 