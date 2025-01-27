const sql = require('mssql');
const fs = require('fs').promises;
const path = require('path');
const { config } = require('../config/database');

async function initializeDatabase() {
    try {
        // SQL script'ini oku
        const sqlScript = await fs.readFile(
            path.join(__dirname, 'init.sql'),
            'utf8'
        );

        // Veritabanına bağlan
        const pool = await sql.connect(config);

        // Script'i çalıştır
        await pool.request().batch(sqlScript);

        console.log('Veritabanı başarıyla oluşturuldu');
        process.exit(0);
    } catch (error) {
        console.error('Veritabanı oluşturulurken hata:', error);
        process.exit(1);
    }
}

initializeDatabase(); 