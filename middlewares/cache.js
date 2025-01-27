const redisService = require('../services/redisService');
const logger = require('../utils/logger');

// Cache middleware factory
function cacheMiddleware(duration = 3600) {
    return async (req, res, next) => {
        // POST, PUT, DELETE isteklerini cache'leme
        if (req.method !== 'GET') {
            return next();
        }

        const cacheKey = `cache:${req.originalUrl}`;

        try {
            // Cache'den veri getir
            const cachedData = await redisService.get(cacheKey);
            if (cachedData) {
                return res.json(cachedData);
            }

            // Orijinal json metodunu sakla
            const originalJson = res.json;

            // json metodunu override et
            res.json = function(data) {
                // Veriyi cache'e kaydet
                redisService.set(cacheKey, data, duration)
                    .catch(error => {
                        logger.error('Cache set error', {
                            key: cacheKey,
                            error: error.message
                        });
                    });

                // Orijinal json metodunu çağır
                return originalJson.call(this, data);
            };

            next();
        } catch (error) {
            logger.error('Cache middleware error', {
                url: req.originalUrl,
                error: error.message
            });
            next();
        }
    };
}

// Cache temizleme middleware'i
function clearCache(pattern) {
    return async (req, res, next) => {
        try {
            await redisService.delByPattern(pattern);
            next();
        } catch (error) {
            logger.error('Cache clear error', {
                pattern,
                error: error.message
            });
            next();
        }
    };
}

module.exports = {
    cacheMiddleware,
    clearCache
}; 