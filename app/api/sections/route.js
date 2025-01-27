import { NextResponse } from 'next/server';
import sql from 'mssql';
import { getConnection } from '@/config/db';

export async function GET() {
  try {
    const pool = await getConnection();
    const result = await pool.request().query(`
      SELECT 
        SectionID as id,
        Name as name,
        ColorCode as colorCode
      FROM Sections
      WHERE IsActive = 1
      ORDER BY Name
    `);

    return NextResponse.json(result.recordset);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const pool = await getConnection();

    const result = await pool.request()
      .input('name', sql.NVarChar, data.name)
      .input('colorCode', sql.NVarChar, data.colorCode)
      .query(`
        INSERT INTO Sections (Name, ColorCode, IsActive)
        VALUES (@name, @colorCode, 1);

        SELECT 
          SectionID as id,
          Name as name,
          ColorCode as colorCode
        FROM Sections
        WHERE SectionID = SCOPE_IDENTITY()
      `);

    return NextResponse.json(result.recordset[0]);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const data = await request.json();
    const pool = await getConnection();

    const result = await pool.request()
      .input('id', sql.Int, data.id)
      .input('name', sql.NVarChar, data.name)
      .input('colorCode', sql.NVarChar, data.colorCode)
      .query(`
        UPDATE Sections
        SET Name = @name,
            ColorCode = @colorCode,
            UpdatedAt = GETDATE()
        OUTPUT INSERTED.*
        WHERE SectionID = @id
      `);

    if (result.rowsAffected[0] === 0) {
      return NextResponse.json({ error: 'Bölge bulunamadı' }, { status: 404 });
    }

    return NextResponse.json(result.recordset[0]);
  } catch (error) {
    console.error('PUT Error:', error);
    return NextResponse.json({ error: 'Bölge güncellenemedi', details: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const data = await request.json();
    const pool = await getConnection();

    const result = await pool.request()
      .input('id', sql.Int, data.id)
      .query(`
        UPDATE Sections
        SET IsActive = 0,
            UpdatedAt = GETDATE()
        WHERE SectionID = @id
      `);

    if (result.rowsAffected[0] === 0) {
      return NextResponse.json({ error: 'Bölge bulunamadı' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Bölge başarıyla silindi' });
  } catch (error) {
    console.error('DELETE Error:', error);
    return NextResponse.json({ error: 'Bölge silinemedi', details: error.message }, { status: 500 });
  }
} 