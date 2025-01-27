import { NextResponse } from 'next/server';
import sql from 'mssql';
import { getConnection } from '@/config/db';

export async function DELETE(request, { params }) {
  try {
    const pool = await getConnection();
    
    await pool.request()
      .input('id', sql.Int, params.id)
      .query(`
        UPDATE Sections
        SET IsActive = 0
        WHERE SectionID = @id
      `);

    return NextResponse.json({ message: 'Bölge başarıyla silindi' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const data = await request.json();
    const pool = await getConnection();
    
    const result = await pool.request()
      .input('id', sql.Int, params.id)
      .input('name', sql.NVarChar, data.name)
      .input('colorCode', sql.NVarChar, data.colorCode)
      .query(`
        UPDATE Sections
        SET 
          Name = @name,
          ColorCode = @colorCode,
          UpdatedAt = GETDATE()
        WHERE SectionID = @id AND IsActive = 1;

        SELECT 
          SectionID as id,
          Name as name,
          ColorCode as colorCode
        FROM Sections
        WHERE SectionID = @id AND IsActive = 1;
      `);

    if (result.recordset.length === 0) {
      return NextResponse.json({ error: 'Bölge bulunamadı' }, { status: 404 });
    }

    return NextResponse.json(result.recordset[0]);
  } catch (error) {
    console.error('PUT Error:', error);
    return NextResponse.json({ 
      error: 'Bölge güncellenemedi', 
      details: error.message 
    }, { status: 500 });
  }
} 