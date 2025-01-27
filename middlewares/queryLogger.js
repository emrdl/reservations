const logger = require('../utils/logger');

// SQL Server sorgu loglama middleware'i
function queryLogger(query, params) {
    const start = Date.now();

    return {
        // Sorgu başlamadan önce
        onBefore: () => {
            logger.debug('SQL Query Starting', {
                query,
                params
            });
        },

        // Sorgu tamamlandıktan sonra
        onAfter: (result) => {
            const duration = Date.now() - start;
            logger.logQuery(query, params, duration);

            // Yavaş sorguları tespit et
            if (duration > 1000) { // 1 saniyeden uzun süren sorgular
                logger.warn('Slow Query Detected', {
                    query,
                    params,
                    duration: `${duration}ms`
                });
            }

            return result;
        },

        // Hata durumunda
        onError: (error) => {
            const duration = Date.now() - start;
            logger.error('Query Error', {
                query,
                params,
                duration: `${duration}ms`,
                error: error.message
            });
            throw error;
        }
    };
}

module.exports = queryLogger; 