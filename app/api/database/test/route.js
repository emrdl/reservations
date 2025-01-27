import { NextResponse } from 'next/server';
import sql from 'mssql';
import { dbConfig, testConnection } from '@/config/db';

export async function GET() {
  try {
    const isConnected = await testConnection();
    
    if (isConnected) {
      return NextResponse.json({ message: 'Veritabanı bağlantısı başarılı' });
    } else {
      return NextResponse.json({ error: 'Veritabanı bağlantısı başarısız' }, { status: 500 });
    }
  } catch (error) {
    console.error('Test Error:', error);
    return NextResponse.json({ error: 'Veritabanı testi başarısız', details: error.message }, { status: 500 });
  }
} 