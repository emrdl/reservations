import sql from 'mssql';

export const dbConfig = {
  user: 'sa',
  password: '123456',
  server: 'localhost',
  database: 'reservations',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
    // instanceName kaldırıldı çünkü varsayılan instance kullanıyoruz
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  },
  requestTimeout: 30000
};

// SQL bağlantı havuzu oluştur
let globalPool;

// Global bağlantı havuzunu al veya oluştur
export async function getConnection() {
  try {
    if (globalPool) {
      return globalPool;
    }
    globalPool = await sql.connect(dbConfig);
    return globalPool;
  } catch (err) {
    console.error('SQL bağlantı havuzu oluşturma hatası:', err);
    throw err;
  }
}

// Veritabanı bağlantısını test etmek için fonksiyon
export async function testConnection() {
  try {
    const pool = await getConnection();
    const result = await pool.request().query('SELECT 1 as testResult');
    console.log('Veritabanı bağlantısı başarılı');
    return true;
  } catch (err) {
    console.error('Veritabanı bağlantı hatası:', err);
    return false;
  }
}

// Uygulama kapanırken bağlantıyı kapat
process.on('SIGINT', async () => {
  if (globalPool) {
    await globalPool.close();
    globalPool = null;
  }
  process.exit(0);
}); 