const metricsService = require('../services/metricsService');
const logger = require('../utils/logger');

function performanceMonitor(req, res, next) {
    const start = process.hrtime();

    // Response gönderildikten sonra metrikleri kaydet
    res.on('finish', () => {
        const [seconds, nanoseconds] = process.hrtime(start);
        const duration = seconds + nanoseconds / 1e9;

        // HTTP istek metriklerini kaydet
        metricsService.recordHttpRequest(
            req.method,
            req.route?.path || req.path,
            res.statusCode,
            duration
        );

        // Yavaş istekleri logla
        if (duration > 1) { // 1 saniyeden uzun süren istekler
            logger.warn('Slow HTTP Request', {
                method: req.method,
                path: req.path,
                duration: `${duration.toFixed(3)}s`,
                statusCode: res.statusCode
            });
        }

        // Hataları kaydet
        if (res.statusCode >= 400) {
            metricsService.recordError(
                res.statusCode >= 500 ? 'server_error' : 'client_error'
            );
        }
    });

    next();
}

module.exports = performanceMonitor; 