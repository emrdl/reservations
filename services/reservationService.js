const { connectDB, sql } = require('../config/database');
const logger = require('../utils/logger');

class ReservationService {
    constructor(websocketService) {
        this.wss = websocketService;
    }

    async createReservation(reservationData) {
        logger.info('Yeni rezervasyon oluşturuluyor', { 
            customerId: reservationData.customerId,
            tableId: reservationData.tableId,
            date: reservationData.reservationDate
        });

        const pool = await connectDB();
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            const {
                customerId,
                tableId,
                reservationDate,
                startTime,
                endTime,
                guestCount,
                notes
            } = reservationData;

            // Masa müsaitlik kontrolü
            const conflictCheck = await transaction.request()
                .input('tableId', sql.Int, tableId)
                .input('date', sql.Date, reservationDate)
                .input('start', sql.Time, startTime)
                .input('end', sql.Time, endTime)
                .query(`
                    SELECT ReservationID
                    FROM Reservations
                    WHERE TableID = @tableId
                    AND ReservationDate = @date
                    AND Status IN ('Pending', 'Confirmed')
                    AND (
                        (StartTime <= @end AND EndTime >= @start)
                        OR (StartTime >= @start AND StartTime <= @end)
                        OR (EndTime >= @start AND EndTime <= @end)
                    )
                `);

            if (conflictCheck.recordset.length > 0) {
                throw new Error('Bu masa seçilen zaman diliminde müsait değil');
            }

            // Rezervasyon oluştur
            const result = await transaction.request()
                .input('customerId', sql.Int, customerId)
                .input('tableId', sql.Int, tableId)
                .input('date', sql.Date, reservationDate)
                .input('start', sql.Time, startTime)
                .input('end', sql.Time, endTime)
                .input('guestCount', sql.Int, guestCount)
                .input('notes', sql.NVarChar, notes)
                .query(`
                    INSERT INTO Reservations (
                        CustomerID, TableID, ReservationDate,
                        StartTime, EndTime, GuestCount, Notes
                    )
                    OUTPUT INSERTED.*
                    VALUES (
                        @customerId, @tableId, @date,
                        @start, @end, @guestCount, @notes
                    )
                `);

            const reservation = result.recordset[0];

            // Rezervasyon geçmişi oluştur
            await transaction.request()
                .input('reservationId', sql.Int, reservation.ReservationID)
                .input('oldStatus', sql.NVarChar, 'New')
                .input('newStatus', sql.NVarChar, 'Pending')
                .input('changedBy', sql.Int, customerId)
                .query(`
                    INSERT INTO ReservationHistory (
                        ReservationID, OldStatus, NewStatus, ChangedBy
                    )
                    VALUES (
                        @reservationId, @oldStatus, @newStatus, @changedBy
                    )
                `);

            await transaction.commit();

            logger.logBusinessEvent('RESERVATION_CREATED', {
                reservationId: reservation.ReservationID,
                customerId: reservationData.customerId,
                tableId: reservationData.tableId
            });

            return reservation;
        } catch (error) {
            logger.error('Rezervasyon oluşturulurken hata', {
                error: error.message,
                customerId: reservationData.customerId
            });
            await transaction.rollback();
            throw error;
        }
    }

    async updateReservationStatus(reservationId, newStatus, userId, notes = '') {
        const pool = await connectDB();
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            // Mevcut rezervasyonu al
            const currentReservation = await transaction.request()
                .input('id', sql.Int, reservationId)
                .query(`
                    SELECT * FROM Reservations WHERE ReservationID = @id
                `);

            if (currentReservation.recordset.length === 0) {
                throw new Error('Rezervasyon bulunamadı');
            }

            const reservation = currentReservation.recordset[0];
            const oldStatus = reservation.Status;

            // Durumu güncelle
            const result = await transaction.request()
                .input('id', sql.Int, reservationId)
                .input('status', sql.NVarChar, newStatus)
                .input('notes', sql.NVarChar, notes)
                .query(`
                    UPDATE Reservations
                    SET Status = @status,
                        Notes = CASE 
                            WHEN @notes = '' THEN Notes 
                            ELSE @notes 
                        END,
                        UpdatedAt = GETDATE()
                    OUTPUT INSERTED.*
                    WHERE ReservationID = @id
                `);

            // Geçmişe kaydet
            await transaction.request()
                .input('reservationId', sql.Int, reservationId)
                .input('oldStatus', sql.NVarChar, oldStatus)
                .input('newStatus', sql.NVarChar, newStatus)
                .input('changedBy', sql.Int, userId)
                .input('notes', sql.NVarChar, notes)
                .query(`
                    INSERT INTO ReservationHistory (
                        ReservationID, OldStatus, NewStatus, 
                        ChangedBy, Notes
                    )
                    VALUES (
                        @reservationId, @oldStatus, @newStatus,
                        @changedBy, @notes
                    )
                `);

            await transaction.commit();

            const updatedReservation = result.recordset[0];

            // Müşteriye bildirim gönder
            await this.notificationService.createNotification(
                reservation.CustomerID,
                'Rezervasyon Durumu Güncellendi',
                `Rezervasyonunuzun durumu ${newStatus} olarak güncellendi.`,
                'RESERVATION'
            );

            return updatedReservation;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    // Diğer metodlar...
}

module.exports = ReservationService; 