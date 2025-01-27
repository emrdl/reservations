import { NextResponse } from 'next/server';
import sql from 'mssql';
import { getConnection } from '@/config/db';

// Tüm masaları getir
export async function GET() {
  try {
    const pool = await getConnection();
    
    // Debug için mevcut kayıtları kontrol et
    const debugQuery = await pool.request().query(`
      SELECT COUNT(*) as tableCount FROM Tables WHERE IsActive = 1;
    `);
    console.log('Aktif masa sayısı:', debugQuery.recordset[0].tableCount);
    
    // Masaları getir
    const result = await pool.request().query(`
      SELECT 
        t.TableID as id,
        t.Number as number,
        t.Name as name,
        t.Capacity as capacity,
        s.Name as section,
        s.ColorCode as sectionColor,
        ts.Name as status,
        t.PositionX as positionX,
        t.PositionY as positionY,
        ISNULL(t.Width, 60) as width,  -- Null ise 60 kullan
        ISNULL(t.Height, 40) as height, -- Null ise 40 kullan
        CAST(ISNULL(t.IsAvailable, 1) as bit) as isAvailable
      FROM Tables t
      JOIN Sections s ON t.SectionID = s.SectionID
      JOIN TableStatuses ts ON t.StatusID = ts.StatusID
      WHERE t.IsActive = 1
      ORDER BY t.Number;
    `);

    // Debug için sonuçları kontrol et
    console.log('Bulunan masalar:', result.recordset);

    const tables = result.recordset.map(table => ({
      id: table.id,
      number: table.number,
      name: table.name,
      capacity: table.capacity,
      section: table.section,
      sectionColor: table.sectionColor,
      status: table.status,
      positionX: table.positionX,
      positionY: table.positionY,
      width: table.width,
      height: table.height,
      isAvailable: Boolean(table.isAvailable)
    }));

    return NextResponse.json(tables);
  } catch (error) {
    console.error('GET Error:', error);
    return NextResponse.json({ 
      error: 'Masalar getirilemedi', 
      details: error.message
    }, { status: 500 });
  }
}

// Yeni masa ekle
export async function POST(request) {
  try {
    const data = await request.json();
    console.log('Gelen veri:', data); // Debug için

    const pool = await getConnection();

    // Bölge adını kontrol et ve dönüştür
    let sectionName = data.section.toUpperCase();
    // Özel bölge adı dönüşümleri
    const sectionMappings = {
      'MAIN': 'ANA SALON',
      'GARDEN': 'BAHÇE',
      'TERRACE': 'TERAS',
      'BALCONY': 'BALKON'
    };

    if (sectionMappings[sectionName]) {
      sectionName = sectionMappings[sectionName];
    }
    
    console.log('Dönüştürülen bölge adı:', sectionName); // Debug için

    // Bölge kontrolü
    const sectionCheck = await pool.request()
      .input('section', sql.NVarChar, sectionName)
      .query(`
        SELECT SectionID, Name 
        FROM Sections 
        WHERE Name = @section AND IsActive = 1
      `);

    const statusCheck = await pool.request()
      .input('status', sql.NVarChar, (data.status || 'EMPTY').toUpperCase())
      .query(`
        SELECT StatusID, Name 
        FROM TableStatuses 
        WHERE Name = @status
      `);

    console.log('Bulunan bölge:', sectionCheck.recordset[0]); // Debug için
    console.log('Bulunan durum:', statusCheck.recordset[0]); // Debug için

    const sectionId = sectionCheck.recordset[0]?.SectionID;
    const statusId = statusCheck.recordset[0]?.StatusID;

    if (!sectionId || !statusId) {
      return NextResponse.json({ 
        error: 'Masa eklenemedi', 
        details: 'Geçersiz bölge veya durum',
        debug: {
          requestedSection: sectionName,
          requestedStatus: data.status || 'EMPTY',
          foundSection: sectionCheck.recordset[0],
          foundStatus: statusCheck.recordset[0],
          availableSections: await pool.request().query(`
            SELECT Name FROM Sections WHERE IsActive = 1
          `).then(result => result.recordset.map(r => r.Name))
        }
      }, { status: 400 });
    }

    // Yeni masayı ekle
    const insertResult = await pool.request()
      .input('number', sql.Int, data.number)
      .input('name', sql.NVarChar, data.name || `Masa ${data.number}`)
      .input('capacity', sql.Int, data.capacity)
      .input('sectionId', sql.Int, sectionId)
      .input('statusId', sql.Int, statusId)
      .input('positionX', sql.Int, data.positionX)
      .input('positionY', sql.Int, data.positionY)
      .query(`
        INSERT INTO Tables (
          Number, Name, Capacity, SectionID, StatusID, 
          PositionX, PositionY, IsAvailable
        )
        VALUES (
          @number, @name, @capacity, @sectionId, @statusId,
          @positionX, @positionY, 1
        );
        
        SELECT 
          t.TableID as id,
          t.Number as number,
          t.Name as name,
          t.Capacity as capacity,
          s.Name as section,
          s.ColorCode as sectionColor,
          ts.Name as status,
          t.PositionX as positionX,
          t.PositionY as positionY,
          t.Width as width,
          t.Height as height,
          CAST(t.IsAvailable as bit) as isAvailable
        FROM Tables t
        JOIN Sections s ON t.SectionID = s.SectionID
        JOIN TableStatuses ts ON t.StatusID = ts.StatusID
        WHERE t.TableID = SCOPE_IDENTITY();
      `);

    const newTable = insertResult.recordset[0];
    
    // Veriyi JSON'a uygun formata çevir
    const responseData = {
      id: newTable.id,
      number: newTable.number,
      name: newTable.name,
      capacity: newTable.capacity,
      section: newTable.section,
      sectionColor: newTable.sectionColor,
      status: newTable.status,
      positionX: newTable.positionX,
      positionY: newTable.positionY,
      width: newTable.width || 60,
      height: newTable.height || 40,
      isAvailable: Boolean(newTable.isAvailable)
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('POST Error:', error);
    return NextResponse.json({ 
      error: 'Masa eklenemedi', 
      details: error.message 
    }, { status: 500 });
  }
}

// Masa güncelle
export async function PUT(request) {
  try {
    const data = await request.json();
    const pool = await getConnection();

    console.log('Gelen güncelleme verisi:', data); // Debug için

    // Güncelleme sorgusunu oluştur
    let updateFields = [];
    if (data.name !== undefined) updateFields.push('Name = @name');
    if (data.number !== undefined) updateFields.push('Number = @number');
    if (data.capacity !== undefined) updateFields.push('Capacity = @capacity');
    if (data.status !== undefined) updateFields.push('StatusID = (SELECT StatusID FROM TableStatuses WHERE Name = @status)');
    if (data.positionX !== undefined) updateFields.push('PositionX = @positionX');
    if (data.positionY !== undefined) updateFields.push('PositionY = @positionY');
    if (data.width !== undefined) updateFields.push('Width = @width');
    if (data.height !== undefined) updateFields.push('Height = @height');

    if (updateFields.length === 0) {
      return NextResponse.json({ error: 'Güncellenecek alan bulunamadı' }, { status: 400 });
    }

    const updateQuery = `
      UPDATE Tables
      SET ${updateFields.join(', ')}, UpdatedAt = GETDATE()
      WHERE TableID = @id;

      SELECT 
        t.TableID as id,
        t.Number as number,
        t.Name as name,
        t.Capacity as capacity,
        s.Name as section,
        s.ColorCode as sectionColor,
        ts.Name as status,
        t.PositionX as positionX,
        t.PositionY as positionY,
        t.Width as width,
        t.Height as height,
        CAST(t.IsAvailable as bit) as isAvailable
      FROM Tables t
      JOIN Sections s ON t.SectionID = s.SectionID
      JOIN TableStatuses ts ON t.StatusID = ts.StatusID
      WHERE t.TableID = @id;
    `;

    console.log('SQL Sorgusu:', updateQuery); // Debug için

    // SQL isteği oluştur
    const sqlRequest = pool.request();

    // Parametreleri ekle
    sqlRequest.input('id', sql.Int, data.id);
    if (data.name !== undefined) sqlRequest.input('name', sql.NVarChar, data.name);
    if (data.number !== undefined) sqlRequest.input('number', sql.Int, data.number);
    if (data.capacity !== undefined) sqlRequest.input('capacity', sql.Int, data.capacity);
    if (data.status !== undefined) sqlRequest.input('status', sql.NVarChar, data.status);
    if (data.positionX !== undefined) sqlRequest.input('positionX', sql.Int, Math.round(data.positionX));
    if (data.positionY !== undefined) sqlRequest.input('positionY', sql.Int, Math.round(data.positionY));
    if (data.width !== undefined) sqlRequest.input('width', sql.Int, Math.round(data.width));
    if (data.height !== undefined) sqlRequest.input('height', sql.Int, Math.round(data.height));

    // Sorguyu çalıştır
    const result = await sqlRequest.query(updateQuery);

    console.log('Güncelleme sonucu:', result); // Debug için

    if (result.rowsAffected[0] === 0) {
      return NextResponse.json({ error: 'Masa bulunamadı' }, { status: 404 });
    }

    // Güncellenmiş veriyi döndür
    const updatedTable = result.recordset[0];
    if (!updatedTable) {
      throw new Error('Güncellenmiş masa bilgisi alınamadı');
    }

    const responseData = {
      id: updatedTable.id,
      number: updatedTable.number,
      name: updatedTable.name,
      capacity: updatedTable.capacity,
      section: updatedTable.section,
      sectionColor: updatedTable.sectionColor,
      status: updatedTable.status,
      positionX: updatedTable.positionX,
      positionY: updatedTable.positionY,
      width: updatedTable.width || 60,
      height: updatedTable.height || 40,
      isAvailable: Boolean(updatedTable.isAvailable)
    };

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('PUT Error:', error);
    return NextResponse.json({ 
      error: 'Masa güncellenemedi', 
      details: error.message,
      stack: error.stack // Debug için
    }, { status: 500 });
  }
}

// Masa sil
export async function DELETE(request) {
  try {
    const data = await request.json();
    const pool = await getConnection();

    const result = await pool.request()
      .input('id', sql.Int, data.id)
      .query(`
        UPDATE Tables
        SET IsActive = 0, UpdatedAt = GETDATE()
        WHERE TableID = @id
      `);

    if (result.rowsAffected[0] === 0) {
      return NextResponse.json({ error: 'Masa bulunamadı' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Masa başarıyla silindi' });
  } catch (error) {
    console.error('DELETE Error:', error);
    return NextResponse.json({ error: 'Masa silinemedi', details: error.message }, { status: 500 });
  }
} 