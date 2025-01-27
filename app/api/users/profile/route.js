import { NextResponse } from 'next/server';
import { userService } from '@/services/userService';

// Profil bilgilerini getir
export async function GET(request) {
  try {

    const profile = await userService.getUserProfile(user.id);
    return NextResponse.json(profile);
    
  } catch (error) {
    console.error('Profil bilgileri hatası:', error);
    return NextResponse.json(
      { error: 'Profil bilgileri alınırken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// Profil bilgilerini güncelle
export async function PUT(request) {
  try {

    const { name, phone, currentPassword, newPassword } = await request.json();

    // Şifre değişikliği varsa kontrol et
    if (currentPassword && newPassword) {
      const currentUser = await userService.getUserProfile(user.id);

      if (!currentPassword) {
        return NextResponse.json(
          { error: 'Mevcut şifre yanlış' },
          { status: 400 }
        );
      }

      // Profili güncelle
      const updatedProfile = await userService.updateUserProfile(user.id, {
        name,
        phone,
        password: newPassword
      });

      return NextResponse.json(updatedProfile);
    }

    // Sadece profil bilgilerini güncelle
    const updatedProfile = await userService.updateUserProfile(user.id, {
      name,
      phone
    });

    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error('Profil güncelleme hatası:', error);
    return NextResponse.json(
      { error: 'Profil güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 