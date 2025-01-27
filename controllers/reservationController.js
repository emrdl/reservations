const ReservationService = require('../services/reservationService');

class ReservationController {
    constructor(websocketService) {
        this.reservationService = new ReservationService(websocketService);
    }

    // Yeni rezervasyon oluştur
    createReservation = async (req, res) => {
        try {
            const reservationData = {
                ...req.body,
                customerId: req.user.UserID
            };
            const reservation = await this.reservationService.createReservation(reservationData);
            res.status(201).json(reservation);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    };

    // Rezervasyon durumunu güncelle
    updateStatus = async (req, res) => {
        try {
            const { id } = req.params;
            const { status, notes } = req.body;
            const userId = req.user.UserID;

            const reservation = await this.reservationService.updateReservationStatus(
                id, status, userId, notes
            );
            res.json(reservation);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    };

    // Müşterinin rezervasyonlarını getir
    getCustomerReservations = async (req, res) => {
        try {
            const pool = await connectDB();
            const result = await pool.request()
                .input('customerId', sql.Int, req.user.UserID)
                .query(`
                    SELECT 
                        r.*,
                        t.TableNumber,
                        t.Capacity,
                        JSON_QUERY((
                            SELECT *
                            FROM ReservationHistory
                            WHERE ReservationID = r.ReservationID
                            ORDER BY CreatedAt DESC
                            FOR JSON PATH
                        )) as History
                    FROM Reservations r
                    JOIN Tables t ON r.TableID = t.TableID
                    WHERE r.CustomerID = @customerId
                    ORDER BY r.ReservationDate DESC, r.StartTime DESC
                `);

            const reservations = result.recordset.map(reservation => ({
                ...reservation,
                History: JSON.parse(reservation.History || '[]')
            }));

            res.json(reservations);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    };

    // Tarih aralığına göre rezervasyonları getir
    getReservationsByDateRange = async (req, res) => {
        try {
            const { startDate, endDate } = req.query;
            const pool = await connectDB();
            
            const result = await pool.request()
                .input('startDate', sql.Date, startDate)
                .input('endDate', sql.Date, endDate)
                .query(`
                    SELECT 
                        r.*,
                        t.TableNumber,
                        t.Capacity,
                        u.Username as CustomerName,
                        u.Email as CustomerEmail
                    FROM Reservations r
                    JOIN Tables t ON r.TableID = t.TableID
                    JOIN Users u ON r.CustomerID = u.UserID
                    WHERE r.ReservationDate BETWEEN @startDate AND @endDate
                    ORDER BY r.ReservationDate, r.StartTime
                `);

            res.json(result.recordset);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    };

    // Belirli bir masanın rezervasyonlarını getir
    getTableReservations = async (req, res) => {
        try {
            const { tableId } = req.params;
            const { date } = req.query;
            
            const pool = await connectDB();
            const result = await pool.request()
                .input('tableId', sql.Int, tableId)
                .input('date', sql.Date, date)
                .query(`
                    SELECT 
                        r.*,
                        u.Username as CustomerName,
                        u.Email as CustomerEmail
                    FROM Reservations r
                    JOIN Users u ON r.CustomerID = u.UserID
                    WHERE r.TableID = @tableId
                    AND r.ReservationDate = @date
                    AND r.Status IN ('Pending', 'Confirmed')
                    ORDER BY r.StartTime
                `);

            res.json(result.recordset);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    };

    // Rezervasyonu iptal et
    cancelReservation = async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user.UserID;
            const { notes } = req.body;

            const reservation = await this.reservationService.updateReservationStatus(
                id, 'Cancelled', userId, notes
            );
            res.json(reservation);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
}

module.exports = ReservationController; 