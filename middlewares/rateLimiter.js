const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 dakika
    max: 100, // IP başına maksimum istek sayısı
    message: {
        error: 'Çok fazla istek gönderdiniz. Lütfen daha sonra tekrar deneyin.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 saat
    max: 5, // IP başına maksimum başarısız giriş denemesi
    message: {
        error: 'Çok fazla başarısız giriş denemesi. Lütfen daha sonra tekrar deneyin.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true // Başarılı istekleri sayma
});

module.exports = { limiter, authLimiter }; 