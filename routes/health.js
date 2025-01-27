const express = require('express');
const router = express.Router();
const { checkConnection, getDatabaseStats } = require('../config/database');
const redisService = require('../services/redisService');
const logger = require('../utils/logger');

// Basit sağlık kontrolü
router.get('/health', async (req, res) => {
    try {
        const dbConnected = await checkConnection();
        const redisHealth = await redisService.healthCheck();
        
        const health = {
            status: dbConnected && redisHealth.status === 'healthy' ? 'healthy' : 'unhealthy',
            timestamp: new Date().toISOString(),
            services: {
                database: {
                    status: dbConnected ? 'connected' : 'disconnected'
                },
                redis: redisHealth
            }
        };

        const statusCode = health.status === 'healthy' ? 200 : 503;
        res.status(statusCode).json(health);

        // Sağlık durumunu logla
        logger.info('Health Check', health);
    } catch (error) {
        logger.error('Health Check Error', error);
        res.status(503).json({
            status: 'error',
            timestamp: new Date().toISOString(),
            error: error.message
        });
    }
});

// Detaylı sistem durumu
router.get('/health/details', async (req, res) => {
    try {
        const dbStats = await getDatabaseStats();
        const redisHealth = await redisService.healthCheck();
        const memoryUsage = process.memoryUsage();
        
        const details = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            system: {
                nodeVersion: process.version,
                platform: process.platform,
                memory: {
                    heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + 'MB',
                    heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + 'MB',
                    rss: Math.round(memoryUsage.rss / 1024 / 1024) + 'MB'
                },
                uptime: Math.round(process.uptime()) + 's'
            },
            database: {
                ...dbStats,
                status: 'connected'
            },
            redis: redisHealth
        };

        res.json(details);

        // Detaylı durumu logla
        logger.info('Detailed Health Check', details);
    } catch (error) {
        logger.error('Detailed Health Check Error', error);
        res.status(503).json({
            status: 'error',
            timestamp: new Date().toISOString(),
            error: error.message
        });
    }
});

module.exports = router; 