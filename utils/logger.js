const winston = require('winston');
const path = require('path');

// Log formatını özelleştir
const customFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ level, message, timestamp, stack, ...meta }) => {
        let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
        
        // Meta verileri ekle
        if (Object.keys(meta).length > 0) {
            log += `\nMeta: ${JSON.stringify(meta, null, 2)}`;
        }

        // Hata stack'ini ekle
        if (stack) {
            log += `\nStack: ${stack}`;
        }

        return log;
    })
);

// Logger'ı yapılandır
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: customFormat,
    transports: [
        // Konsol çıktısı
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                customFormat
            )
        }),

        // Günlük dosya çıktısı
        new winston.transports.File({
            filename: path.join('logs', 'error.log'),
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
            tailable: true
        }),

        // Tüm loglar için dosya çıktısı
        new winston.transports.File({
            filename: path.join('logs', 'combined.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5,
            tailable: true
        })
    ],
    // Kritik hataları yakala
    exceptionHandlers: [
        new winston.transports.File({
            filename: path.join('logs', 'exceptions.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5,
            tailable: true
        })
    ],
    // Promise reject'leri yakala
    rejectionHandlers: [
        new winston.transports.File({
            filename: path.join('logs', 'rejections.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5,
            tailable: true
        })
    ]
});

// HTTP istekleri için özel log fonksiyonu
logger.logRequest = (req, res, responseTime) => {
    const logData = {
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        responseTime: `${responseTime}ms`,
        userAgent: req.get('user-agent'),
        ip: req.ip,
        userId: req.user?.UserID
    };

    const message = `${req.method} ${req.originalUrl} ${res.statusCode} ${responseTime}ms`;
    
    if (res.statusCode >= 500) {
        logger.error(message, logData);
    } else if (res.statusCode >= 400) {
        logger.warn(message, logData);
    } else {
        logger.info(message, logData);
    }
};

// Veritabanı sorguları için özel log fonksiyonu
logger.logQuery = (query, params, duration) => {
    logger.debug('Database Query', {
        query,
        params,
        duration: `${duration}ms`
    });
};

// WebSocket olayları için özel log fonksiyonu
logger.logWebSocket = (event, data, userId) => {
    logger.info('WebSocket Event', {
        event,
        data,
        userId
    });
};

// Dış servis çağrıları için özel log fonksiyonu
logger.logExternalService = (service, method, url, duration, success) => {
    const logData = {
        service,
        method,
        url,
        duration: `${duration}ms`,
        success
    };

    if (success) {
        logger.info(`External Service Call: ${service}`, logData);
    } else {
        logger.error(`External Service Error: ${service}`, logData);
    }
};

// İş mantığı olayları için özel log fonksiyonu
logger.logBusinessEvent = (event, data, userId) => {
    logger.info('Business Event', {
        event,
        data,
        userId
    });
};

// Güvenlik olayları için özel log fonksiyonu
logger.logSecurity = (event, data, severity = 'warn') => {
    logger[severity]('Security Event', {
        event,
        ...data
    });
};

// Performans metrikleri için özel log fonksiyonu
logger.logPerformance = (metric, value, tags = {}) => {
    logger.info('Performance Metric', {
        metric,
        value,
        tags
    });
};

module.exports = logger; 