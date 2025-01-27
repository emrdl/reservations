const logger = require('../utils/logger');

function requestLogger(req, res, next) {
    const start = Date.now();

    // Response gönderildikten sonra log kaydı oluştur
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.logRequest(req, res, duration);
    });

    next();
}

module.exports = requestLogger; 