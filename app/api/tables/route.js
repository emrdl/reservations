import { NextResponse } from 'next/server';
import { tableService } from '@/services/tableService';

// Tüm masaları getir
export async function GET() {
  try {
    const tables = await tableService.getAllTables();
    return NextResponse.json(tables);
  } catch (error) {
    console.error('Masa listesi hatası:', error);
    return NextResponse.json(
      { error: 'Masalar alınırken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// Yeni masa ekle
export async function POST(request) {
  try {

    const { number, name, capacity, section } = await request.json();

    // Masa numarası kontrolü
    const existingTable = await tableService.findTableByNumber(number);

    if (existingTable) {
      return NextResponse.json(
        { error: 'Bu masa numarası zaten kullanımda' },
        { status: 400 }
      );
    }

    const table = await tableService.createTable(number, name, capacity, section);

    return NextResponse.json(table);
  } catch (error) {
    console.error('Masa ekleme hatası:', error);
    return NextResponse.json(
      { error: 'Masa eklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// Masa güncelle
export async function PUT(request) {
  try {

    const { id, number, ...data } = await request.json();

    // Masa numarası değiştiriliyorsa kontrol et
    if (number) {
      const existingTable = await tableService.findTableByNumber(number);

      if (existingTable) {
        return NextResponse.json(
          { error: 'Bu masa numarası zaten kullanımda' },
          { status: 400 }
        );
      }

      data.number = number;
    }

    const table = await tableService.updateTable(id, data);

    return NextResponse.json(table);
  } catch (error) {
    console.error('Masa güncelleme hatası:', error);
    return NextResponse.json(
      { error: 'Masa güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// Masa sil
export async function DELETE(request) {
  try {

    const { id } = await request.json();

    // Masaya ait rezervasyon ve sipariş kontrolü
    const table = await tableService.findTableById(id);

    if (table.reservations.length > 0 || table.orders.length > 0) {
      return NextResponse.json(
        { error: 'Bu masaya ait aktif rezervasyon veya siparişler var' },
        { status: 400 }
      );
    }

    await tableService.deleteTable(id);

    return NextResponse.json({ message: 'Masa başarıyla silindi' });
  } catch (error) {
    console.error('Masa silme hatası:', error);
    return NextResponse.json(
      { error: 'Masa silinirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 