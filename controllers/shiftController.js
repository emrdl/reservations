const { connectDB, sql } = require('../config/database');

const shiftController = {
    // Tüm vardiyaları getir
    getAllShifts: async (req, res) => {
        try {
            const pool = await connectDB();
            const result = await pool.request()
                .query(`
                    SELECT 
                        s.*,
                        st.FirstName + ' ' + st.LastName as StaffName,
                        st.Position as StaffPosition
                    FROM Shifts s
                    JOIN Staff st ON s.StaffID = st.StaffID
                    ORDER BY s.ShiftDate DESC, s.StartTime DESC
                `);
            res.json(result.recordset);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Yeni vardiya oluştur
    createShift: async (req, res) => {
        try {
            const { staffId, shiftDate, startTime, endTime, status = 'Scheduled' } = req.body;

            // Vardiya çakışması kontrolü
            const pool = await connectDB();
            const checkOverlap = await pool.request()
                .input('staffId', sql.Int, staffId)
                .input('shiftDate', sql.Date, shiftDate)
                .input('startTime', sql.Time, startTime)
                .input('endTime', sql.Time, endTime)
                .query(`
                    SELECT ShiftID
                    FROM Shifts
                    WHERE StaffID = @staffId
                    AND ShiftDate = @shiftDate
                    AND (
                        (StartTime <= @endTime AND EndTime >= @startTime)
                        OR
                        (StartTime >= @startTime AND StartTime <= @endTime)
                        OR
                        (EndTime >= @startTime AND EndTime <= @endTime)
                    )
                `);

            if (checkOverlap.recordset.length > 0) {
                return res.status(400).json({
                    message: 'Bu personel için seçilen zaman aralığında başka bir vardiya bulunmaktadır.'
                });
            }

            const result = await pool.request()
                .input('staffId', sql.Int, staffId)
                .input('shiftDate', sql.Date, shiftDate)
                .input('startTime', sql.Time, startTime)
                .input('endTime', sql.Time, endTime)
                .input('status', sql.NVarChar, status)
                .query(`
                    INSERT INTO Shifts (
                        StaffID, ShiftDate, StartTime, 
                        EndTime, Status
                    )
                    OUTPUT INSERTED.*
                    VALUES (
                        @staffId, @shiftDate, @startTime,
                        @endTime, @status
                    )
                `);

            res.status(201).json(result.recordset[0]);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Vardiya güncelle
    updateShift: async (req, res) => {
        try {
            const { id } = req.params;
            const { staffId, shiftDate, startTime, endTime, status } = req.body;

            const pool = await connectDB();

            // Vardiya çakışması kontrolü (kendi ID'si hariç)
            const checkOverlap = await pool.request()
                .input('staffId', sql.Int, staffId)
                .input('shiftDate', sql.Date, shiftDate)
                .input('startTime', sql.Time, startTime)
                .input('endTime', sql.Time, endTime)
                .input('id', sql.Int, id)
                .query(`
                    SELECT ShiftID
                    FROM Shifts
                    WHERE StaffID = @staffId
                    AND ShiftDate = @shiftDate
                    AND ShiftID != @id
                    AND (
                        (StartTime <= @endTime AND EndTime >= @startTime)
                        OR
                        (StartTime >= @startTime AND StartTime <= @endTime)
                        OR
                        (EndTime >= @startTime AND EndTime <= @endTime)
                    )
                `);

            if (checkOverlap.recordset.length > 0) {
                return res.status(400).json({
                    message: 'Bu personel için seçilen zaman aralığında başka bir vardiya bulunmaktadır.'
                });
            }

            const result = await pool.request()
                .input('id', sql.Int, id)
                .input('staffId', sql.Int, staffId)
                .input('shiftDate', sql.Date, shiftDate)
                .input('startTime', sql.Time, startTime)
                .input('endTime', sql.Time, endTime)
                .input('status', sql.NVarChar, status)
                .query(`
                    UPDATE Shifts
                    SET StaffID = @staffId,
                        ShiftDate = @shiftDate,
                        StartTime = @startTime,
                        EndTime = @endTime,
                        Status = @status,
                        UpdatedAt = GETDATE()
                    OUTPUT INSERTED.*
                    WHERE ShiftID = @id
                `);

            if (result.rowsAffected[0] === 0) {
                return res.status(404).json({ message: 'Vardiya bulunamadı' });
            }

            res.json(result.recordset[0]);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Vardiya sil
    deleteShift: async (req, res) => {
        try {
            const { id } = req.params;
            const pool = await connectDB();

            // Gelecek tarihli vardiyaları kontrol et
            const checkFutureShift = await pool.request()
                .input('id', sql.Int, id)
                .query(`
                    SELECT ShiftID 
                    FROM Shifts 
                    WHERE ShiftID = @id 
                    AND ShiftDate < GETDATE()
                `);

            if (checkFutureShift.recordset.length > 0) {
                return res.status(400).json({
                    message: 'Geçmiş vardiyalar silinemez.'
                });
            }

            const result = await pool.request()
                .input('id', sql.Int, id)
                .query('DELETE FROM Shifts WHERE ShiftID = @id');

            if (result.rowsAffected[0] === 0) {
                return res.status(404).json({ message: 'Vardiya bulunamadı' });
            }

            res.json({ message: 'Vardiya başarıyla silindi' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = shiftController; 