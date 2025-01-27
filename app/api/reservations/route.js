import { NextResponse } from 'next/server'
import { reservationService } from '@/services/reservationService'

// Tüm rezervasyonları getir
export async function GET(request) {
  try {
    const reservations = await reservationService.getAllReservations()
    return NextResponse.json(reservations)
  } catch (error) {
    console.error('Rezervasyon listesi hatası:', error)
    return NextResponse.json(
      { error: 'Rezervasyonlar alınırken bir hata oluştu' },
      { status: 500 }
    )
  }
}

// Yeni rezervasyon oluştur
export async function POST(request) {
  try {

    const { date, time, guests, notes, tableId } = await request.json()

    // Masa müsaitlik kontrolü
    if (tableId) {
      const existingReservation = await reservationService.checkTableAvailability(date, time, tableId)

      if (existingReservation) {
        return NextResponse.json(
          { error: 'Bu masa seçilen tarih ve saatte dolu' },
          { status: 400 }
        )
      }
    }

    const reservation = await reservationService.createReservation(date, time, guests, notes, tableId, user.id)
    
    return NextResponse.json(reservation)
  } catch (error) {
    console.error('Rezervasyon oluşturma hatası:', error)
    return NextResponse.json(
      { error: 'Rezervasyon oluşturulurken bir hata oluştu' },
      { status: 500 }
    )
  }
}

// Rezervasyon güncelle
export async function PUT(request) {
  try {

    const { id, status, notes } = await request.json()

    // Rezervasyonu bul
    const reservation = await reservationService.getReservationById(id)

    // Yetki kontrolü
    if (!['ADMIN', 'MANAGER', 'STAFF'].includes(user.role) && reservation.userId !== user.id) {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz yok' },
        { status: 403 }
      )
    }

    const updatedReservation = await reservationService.updateReservation(id, status, notes)
    
    return NextResponse.json(updatedReservation)
  } catch (error) {
    console.error('Rezervasyon güncelleme hatası:', error)
    return NextResponse.json(
      { error: 'Rezervasyon güncellenirken bir hata oluştu' },
      { status: 500 }
    )
  }
}

// Rezervasyon sil
export async function DELETE(request) {
  try {

    const { id } = await request.json()

    // Rezervasyonu bul
    const reservation = await reservationService.getReservationById(id)

    // Yetki kontrolü
    if (!['ADMIN', 'MANAGER'].includes(user.role) && reservation.userId !== user.id) {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz yok' },
        { status: 403 }
      )
    }

    await reservationService.deleteReservation(id)
    
    return NextResponse.json({ message: 'Rezervasyon başarıyla silindi' })
  } catch (error) {
    console.error('Rezervasyon silme hatası:', error)
    return NextResponse.json(
      { error: 'Rezervasyon silinirken bir hata oluştu' },
      { status: 500 }
    )
  }
} 