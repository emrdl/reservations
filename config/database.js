const sql = require('mssql');
const queryLogger = require('../middlewares/queryLogger');
const logger = require('../utils/logger');

const config = {
    server: process.env.DB_HOST,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

// Veritabanı bağlantı havuzu
let pool = null;

async function connectDB() {
    try {
        if (pool) {
            return pool;
        }
        
        console.log('Veritabanı bağlantı ayarları:', {
            server: config.server,
            database: config.database,
            user: config.user,
            port: config.port
        });
        
        pool = await sql.connect(config);
        console.log('Veritabanına başarıyla bağlanıldı');
        return pool;
    } catch (error) {
        console.error('Veritabanı bağlantı hatası:', error);
        pool = null;
        throw error;
    }
}

// Sorgu çalıştırma fonksiyonu
async function executeQuery(query, params = {}) {
    const queryLog = queryLogger(query, params);
    
    try {
        queryLog.onBefore();
        const pool = await connectDB();
        const result = await pool.request()
            .query(query);
        return queryLog.onAfter(result);
    } catch (error) {
        queryLog.onError(error);
    }
}

// Bağlantı havuzunu kapat
async function closePool() {
    try {
        if (pool) {
            await pool.close();
            pool = null;
            logger.info('Database connection pool closed');
        }
    } catch (error) {
        logger.error('Error closing database pool', error);
        throw error;
    }
}

// Bağlantı durumunu kontrol et
async function checkConnection() {
    try {
        const pool = await connectDB();
        const result = await pool.request()
            .query('SELECT 1 as connected');
        
        return result.recordset[0].connected === 1;
    } catch (error) {
        logger.error('Database Health Check Failed', error);
        return false;
    }
}

// Veritabanı istatistiklerini al
async function getDatabaseStats() {
    try {
        const pool = await connectDB();
        const result = await pool.request()
            .query(`
                SELECT 
                    DB_NAME() as DatabaseName,
                    (SELECT COUNT(*) FROM sys.tables) as TableCount,
                    (
                        SELECT SUM(row_count)
                        FROM sys.dm_db_partition_stats
                        WHERE index_id = 1
                    ) as TotalRows,
                    (
                        SELECT SUM(size * 8 / 1024)
                        FROM sys.database_files
                    ) as SizeMB
            `);

        const stats = result.recordset[0];
        logger.info('Database Stats', stats);
        return stats;
    } catch (error) {
        logger.error('Error getting database stats', error);
        throw error;
    }
}

module.exports = {
    connectDB,
    executeQuery,
    closePool,
    checkConnection,
    getDatabaseStats,
    sql
}; 