const fs = require('fs').promises;
const path = require('path');

const logger = async (req, res, next) => {
    const timestamp = new Date().toISOString();
    const { method, url, body, query, params } = req;
    
    const logEntry = {
        timestamp,
        method,
        url,
        body: method !== 'GET' ? body : undefined,
        query,
        params,
        ip: req.ip
    };

    try {
        const logDir = path.join(__dirname, '../logs');
        const logFile = path.join(logDir, `${new Date().toISOString().split('T')[0]}.log`);

        // Logs dizini yoksa oluştur
        await fs.mkdir(logDir, { recursive: true });

        // Log dosyasına yaz
        await fs.appendFile(
            logFile,
            JSON.stringify(logEntry) + '\n',
            'utf8'
        );
    } catch (error) {
        console.error('Logging error:', error);
    }

    next();
};

module.exports = logger; 