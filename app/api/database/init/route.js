import { NextResponse } from 'next/server';
import sql from 'mssql';
import { dbConfig } from '@/config/db';
import fs from 'fs';
import path from 'path';

export async function GET() {
    let pool;
    try {
        // SQL dosyasını oku
        const sqlFile = path.join(process.cwd(), 'database', 'init.sql');
        const sqlScript = fs.readFileSync(sqlFile, 'utf8');

        // SQL komutlarını ayır
        const commands = sqlScript.split('GO');

        pool = await sql.connect(dbConfig);

        // Her komutu sırayla çalıştır
        for (const command of commands) {
            if (command.trim()) {
                await pool.request().query(command);
            }
        }

        return NextResponse.json({ message: 'Veritabanı başarıyla oluşturuldu' });
    } catch (error) {
        console.error('Database Init Error:', error);
        return NextResponse.json({ error: 'Veritabanı oluşturulamadı', details: error.message }, { status: 500 });
    } finally {
        if (pool) {
            await pool.close();
        }
    }
} 