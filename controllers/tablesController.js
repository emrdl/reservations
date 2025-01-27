const { connectDB, sql } = require('../config/database');

const tablesController = {
    // Tüm masaları getir
    getAllTables: async (req, res) => {
        try {
            const pool = await connectDB();
            const result = await pool.request()
                .query(`
                    SELECT t.*,
                           ISNULL(o.OrderID, 0) as CurrentOrderID,
                           o.OrderStatus as CurrentOrderStatus
                    FROM Tables t
                    LEFT JOIN Orders o ON t.TableID = o.TableID 
                        AND o.OrderStatus IN ('Pending', 'In Progress', 'Ready')
                    ORDER BY t.TableNumber
                `);
            res.json(result.recordset);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Yeni masa ekle
    createTable: async (req, res) => {
        try {
            const { tableNumber, capacity } = req.body;
            const pool = await connectDB();

            // Masa numarası kontrolü
            const checkTable = await pool.request()
                .input('tableNumber', sql.NVarChar, tableNumber)
                .query('SELECT TableID FROM Tables WHERE TableNumber = @tableNumber');

            if (checkTable.recordset.length > 0) {
                return res.status(400).json({ message: 'Bu masa numarası zaten kullanımda' });
            }

            const result = await pool.request()
                .input('tableNumber', sql.NVarChar, tableNumber)
                .input('capacity', sql.Int, capacity)
                .query(`
                    INSERT INTO Tables (TableNumber, Capacity)
                    OUTPUT INSERTED.*
                    VALUES (@tableNumber, @capacity)
                `);

            res.status(201).json(result.recordset[0]);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Masa güncelle
    updateTable: async (req, res) => {
        try {
            const { id } = req.params;
            const { tableNumber, capacity } = req.body;

            const pool = await connectDB();

            // Masa numarası kontrolü (kendi ID'si hariç)
            const checkTable = await pool.request()
                .input('tableNumber', sql.NVarChar, tableNumber)
                .input('id', sql.Int, id)
                .query('SELECT TableID FROM Tables WHERE TableNumber = @tableNumber AND TableID != @id');

            if (checkTable.recordset.length > 0) {
                return res.status(400).json({ message: 'Bu masa numarası zaten kullanımda' });
            }

            const result = await pool.request()
                .input('id', sql.Int, id)
                .input('tableNumber', sql.NVarChar, tableNumber)
                .input('capacity', sql.Int, capacity)
                .query(`
                    UPDATE Tables
                    SET TableNumber = @tableNumber,
                        Capacity = @capacity
                    OUTPUT INSERTED.*
                    WHERE TableID = @id
                `);

            if (result.rowsAffected[0] === 0) {
                return res.status(404).json({ message: 'Masa bulunamadı' });
            }

            res.json(result.recordset[0]);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Masa durumunu güncelle
    updateTableStatus: async (req, res) => {
        try {
            const { id } = req.params;
            const { status } = req.body;

            const pool = await connectDB();
            const result = await pool.request()
                .input('id', sql.Int, id)
                .input('status', sql.NVarChar, status)
                .query(`
                    UPDATE Tables
                    SET Status = @status
                    OUTPUT INSERTED.*
                    WHERE TableID = @id
                `);

            if (result.rowsAffected[0] === 0) {
                return res.status(404).json({ message: 'Masa bulunamadı' });
            }

            res.json(result.recordset[0]);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Masa sil
    deleteTable: async (req, res) => {
        try {
            const { id } = req.params;
            const pool = await connectDB();

            // Masaya ait siparişleri kontrol et
            const checkOrders = await pool.request()
                .input('id', sql.Int, id)
                .query('SELECT COUNT(*) as count FROM Orders WHERE TableID = @id');

            if (checkOrders.recordset[0].count > 0) {
                return res.status(400).json({
                    message: 'Bu masaya ait siparişler bulunmaktadır. Önce siparişleri silmelisiniz.'
                });
            }

            const result = await pool.request()
                .input('id', sql.Int, id)
                .query('DELETE FROM Tables WHERE TableID = @id');

            if (result.rowsAffected[0] === 0) {
                return res.status(404).json({ message: 'Masa bulunamadı' });
            }

            res.json({ message: 'Masa başarıyla silindi' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = tablesController; 