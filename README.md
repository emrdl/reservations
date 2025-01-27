# Rezervasyon Yönetim Sistemi

Bu proje, restoranlar için geliştirilmiş bir rezervasyon ve sipariş yönetim sistemidir.

## Özellikler

- Masa yönetimi
- Rezervasyon yönetimi
- Müşteri yönetimi
- Ayarlar

## Teknolojiler

- Next.js 14
- React
- MSSQL
- Tailwind CSS
- JWT Authentication

## Kurulum

1. Projeyi klonlayın:
```bash
git clone https://github.com/yourusername/reservation-management.git
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. `.env` dosyasını oluşturun:
```
DATABASE_URL="postgresql://username:password@localhost:5432/reservation_management"
JWT_SECRET="your-secret-key-here"
```

4. Veritabanı migration'larını çalıştırın:
```bash
npx mssql migrate dev
```

5. Geliştirme sunucusunu başlatın:
```bash
npm run dev
```

## Lisans

MIT