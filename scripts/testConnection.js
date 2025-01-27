const sql = require('mssql');
require('dotenv').config();

const config = {
    server: 'localhost',  // SQL Server 2022 için
    database: 'RestaurantManagementSystem',
    user: 'sa',
    password: '123456',
    options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true
    }
};

async function testConnection() {
    try {
        console.log('Bağlantı deneniyor...');
        console.log('Bağlantı ayarları:', config);
        const pool = await sql.connect(config);
        const result = await pool.request().query('SELECT 1 as test');
        console.log('Bağlantı başarılı:', result.recordset);
        await sql.close();
    } catch (err) {
        console.error('Bağlantı hatası:', err);
    }
}

testConnection(); 