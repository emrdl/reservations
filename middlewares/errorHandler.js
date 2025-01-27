const { ValidationError } = require('../utils/errors');

function errorHandler(err, req, res, next) {
    console.error('Hata:', err);

    // Özel hata sınıflarını kontrol et
    if (err instanceof ValidationError) {
        return res.status(400).json({
            error: err.message,
            details: err.details
        });
    }

    // SQL Server hataları
    if (err.class === 14) { // SQL Server bağlantı hatası
        return res.status(503).json({
            error: 'Veritabanına bağlanılamıyor',
            code: 'DB_CONNECTION_ERROR'
        });
    }

    if (err.class === 16) { // SQL Server genel hataları
        return res.status(400).json({
            error: 'Veritabanı işlemi başarısız',
            code: 'DB_OPERATION_ERROR',
            details: err.message
        });
    }

    // JWT hataları
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            error: 'Geçersiz token',
            code: 'INVALID_TOKEN'
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            error: 'Token süresi dolmuş',
            code: 'TOKEN_EXPIRED'
        });
    }

    // Stripe hataları
    if (err.type === 'StripeCardError') {
        return res.status(400).json({
            error: 'Ödeme işlemi başarısız',
            code: 'PAYMENT_ERROR',
            details: err.message
        });
    }

    // Dosya yükleme hataları
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
            error: 'Dosya boyutu çok büyük',
            code: 'FILE_TOO_LARGE'
        });
    }

    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({
            error: 'Desteklenmeyen dosya türü',
            code: 'UNSUPPORTED_FILE_TYPE'
        });
    }

    // Rate limit hataları
    if (err.type === 'TooManyRequests') {
        return res.status(429).json({
            error: 'Çok fazla istek gönderildi',
            code: 'TOO_MANY_REQUESTS',
            retryAfter: err.retryAfter
        });
    }

    // Websocket hataları
    if (err.code === 'WEBSOCKET_ERROR') {
        return res.status(500).json({
            error: 'Gerçek zamanlı iletişim hatası',
            code: 'WEBSOCKET_ERROR'
        });
    }

    // Push notification hataları
    if (err.code === 'PUSH_NOTIFICATION_ERROR') {
        return res.status(500).json({
            error: 'Bildirim gönderilemedi',
            code: 'PUSH_NOTIFICATION_ERROR'
        });
    }

    // SMTP hataları
    if (err.code === 'SMTP_ERROR') {
        return res.status(500).json({
            error: 'E-posta gönderilemedi',
            code: 'EMAIL_ERROR'
        });
    }

    // SMS hataları
    if (err.code === 'SMS_ERROR') {
        return res.status(500).json({
            error: 'SMS gönderilemedi',
            code: 'SMS_ERROR'
        });
    }

    // Geliştirme ortamında daha detaylı hata bilgisi
    if (process.env.NODE_ENV === 'development') {
        return res.status(500).json({
            error: err.message,
            stack: err.stack,
            code: 'INTERNAL_SERVER_ERROR'
        });
    }

    // Prodüksiyon ortamında genel hata mesajı
    return res.status(500).json({
        error: 'Bir hata oluştu',
        code: 'INTERNAL_SERVER_ERROR'
    });
}

module.exports = errorHandler; 