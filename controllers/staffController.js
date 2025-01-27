const { connectDB, sql } = require('../config/database');

const staffController = {
    // Tüm personeli getir
    getAllStaff: async (req, res) => {
        try {
            const pool = await connectDB();
            const result = await pool.request()
                .query(`
                    SELECT s.*, u.Email, u.Username 
                    FROM Staff s
                    JOIN Users u ON s.UserID = u.UserID
                    ORDER BY s.CreatedAt DESC
                `);
            res.json(result.recordset);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // ID'ye göre personel getir
    getStaffById: async (req, res) => {
        try {
            const { id } = req.params;
            const pool = await connectDB();
            const result = await pool.request()
                .input('id', sql.Int, id)
                .query(`
                    SELECT s.*, u.Email, u.Username 
                    FROM Staff s
                    JOIN Users u ON s.UserID = u.UserID
                    WHERE s.StaffID = @id
                `);
            
            if (result.recordset.length === 0) {
                return res.status(404).json({ message: 'Personel bulunamadı' });
            }
            
            res.json(result.recordset[0]);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Yeni personel oluştur
    createStaff: async (req, res) => {
        try {
            const {
                userId,
                firstName,
                lastName,
                phoneNumber,
                address,
                position,
                salary,
                hireDate
            } = req.body;

            const pool = await connectDB();
            const result = await pool.request()
                .input('userId', sql.Int, userId)
                .input('firstName', sql.NVarChar, firstName)
                .input('lastName', sql.NVarChar, lastName)
                .input('phoneNumber', sql.NVarChar, phoneNumber)
                .input('address', sql.NVarChar, address)
                .input('position', sql.NVarChar, position)
                .input('salary', sql.Decimal, salary)
                .input('hireDate', sql.Date, hireDate)
                .query(`
                    INSERT INTO Staff (
                        UserID, FirstName, LastName, PhoneNumber, 
                        Address, Position, Salary, HireDate
                    )
                    OUTPUT INSERTED.*
                    VALUES (
                        @userId, @firstName, @lastName, @phoneNumber,
                        @address, @position, @salary, @hireDate
                    )
                `);

            res.status(201).json(result.recordset[0]);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Personel bilgilerini güncelle
    updateStaff: async (req, res) => {
        try {
            const { id } = req.params;
            const {
                firstName,
                lastName,
                phoneNumber,
                address,
                position,
                salary,
                status
            } = req.body;

            const pool = await connectDB();
            const result = await pool.request()
                .input('id', sql.Int, id)
                .input('firstName', sql.NVarChar, firstName)
                .input('lastName', sql.NVarChar, lastName)
                .input('phoneNumber', sql.NVarChar, phoneNumber)
                .input('address', sql.NVarChar, address)
                .input('position', sql.NVarChar, position)
                .input('salary', sql.Decimal, salary)
                .input('status', sql.NVarChar, status)
                .query(`
                    UPDATE Staff
                    SET FirstName = @firstName,
                        LastName = @lastName,
                        PhoneNumber = @phoneNumber,
                        Address = @address,
                        Position = @position,
                        Salary = @salary,
                        Status = @status,
                        UpdatedAt = GETDATE()
                    OUTPUT INSERTED.*
                    WHERE StaffID = @id
                `);

            if (result.rowsAffected[0] === 0) {
                return res.status(404).json({ message: 'Personel bulunamadı' });
            }

            res.json(result.recordset[0]);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Personel sil
    deleteStaff: async (req, res) => {
        try {
            const { id } = req.params;
            const pool = await connectDB();
            
            // Önce personelin vardiyalarını kontrol et
            const shiftsResult = await pool.request()
                .input('id', sql.Int, id)
                .query('SELECT COUNT(*) as shiftCount FROM Shifts WHERE StaffID = @id');

            if (shiftsResult.recordset[0].shiftCount > 0) {
                return res.status(400).json({ 
                    message: 'Bu personele ait vardiyalar bulunmaktadır. Önce vardiyaları silinmelidir.' 
                });
            }

            const result = await pool.request()
                .input('id', sql.Int, id)
                .query('DELETE FROM Staff WHERE StaffID = @id');

            if (result.rowsAffected[0] === 0) {
                return res.status(404).json({ message: 'Personel bulunamadı' });
            }

            res.json({ message: 'Personel başarıyla silindi' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = staffController; 