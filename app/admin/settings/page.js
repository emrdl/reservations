'use client';
import { useState, useEffect } from 'react';
import { FiSave } from 'react-icons/fi';

export default function SettingsPage() {
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    restaurantName: '',
    email: '',
    phone: '',
    address: '',
    currency: 'TRY',
    language: 'tr',
    timeZone: 'Europe/Istanbul',
    openingHours: {
      monday: { open: '09:00', close: '22:00', isOpen: true },
      tuesday: { open: '09:00', close: '22:00', isOpen: true },
      wednesday: { open: '09:00', close: '22:00', isOpen: true },
      thursday: { open: '09:00', close: '22:00', isOpen: true },
      friday: { open: '09:00', close: '23:00', isOpen: true },
      saturday: { open: '09:00', close: '23:00', isOpen: true },
      sunday: { open: '09:00', close: '22:00', isOpen: true }
    },
    notifications: {
      email: true,
      sms: false
    }
  });

  useEffect(() => {
    setIsClient(true);
    fetchSettings();
  }, []);

  // Ayarları getir
  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      if (!response.ok) throw new Error('Ayarlar alınamadı');
      const data = await response.json();
      setSettings(data);
    } catch (error) {
      console.error('Ayarlar hatası:', error);
      // TODO: Hata bildirimi göster
    } finally {
      setLoading(false);
    }
  };

  // Ayarları kaydet
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(settings)
      });

      if (!response.ok) throw new Error('Ayarlar kaydedilemedi');
      
      // TODO: Başarı bildirimi göster
    } catch (error) {
      console.error('Ayar kaydetme hatası:', error);
      // TODO: Hata bildirimi göster
    } finally {
      setSaving(false);
    }
  };

  // Çalışma saati güncelle
  const handleUpdateHours = (day, field, value) => {
    setSettings(prev => ({
      ...prev,
      openingHours: {
        ...prev.openingHours,
        [day]: {
          ...prev.openingHours[day],
          [field]: value
        }
      }
    }));
  };

  // Bildirim ayarı güncelle
  const handleUpdateNotification = (type, value) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [type]: value
      }
    }));
  };

  const days = {
    monday: 'Pazartesi',
    tuesday: 'Salı',
    wednesday: 'Çarşamba',
    thursday: 'Perşembe',
    friday: 'Cuma',
    saturday: 'Cumartesi',
    sunday: 'Pazar'
  };

  if (!isClient) {
    return null;
  }

  return (
    <div className="p-8">
      {/* Başlık */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Ayarlar</h1>
          <p className="text-gray-500">Restoran ayarlarını yönetin</p>
        </div>
        <button 
          onClick={handleSaveSettings}
          disabled={saving}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg flex items-center gap-2"
        >
          <FiSave />
          {saving ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">Yükleniyor...</div>
      ) : (
        <form onSubmit={handleSaveSettings} className="space-y-8">
          {/* Genel Ayarlar */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">Genel Ayarlar</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Restoran Adı
                </label>
                <input
                  type="text"
                  value={settings.restaurantName}
                  onChange={(e) => setSettings({ ...settings, restaurantName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-posta
                </label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefon
                </label>
                <input
                  type="tel"
                  value={settings.phone}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adres
                </label>
                <textarea
                  value={settings.address}
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={3}
                  required
                />
              </div>
            </div>
          </div>

          {/* Çalışma Saatleri */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">Çalışma Saatleri</h2>
            <div className="space-y-4">
              {Object.entries(days).map(([day, label]) => (
                <div key={day} className="flex items-center gap-4">
                  <div className="w-32">{label}</div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.openingHours[day].isOpen}
                      onChange={(e) => handleUpdateHours(day, 'isOpen', e.target.checked)}
                      className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                    />
                    <span className="text-sm">Açık</span>
                  </div>
                  <input
                    type="time"
                    value={settings.openingHours[day].open}
                    onChange={(e) => handleUpdateHours(day, 'open', e.target.value)}
                    className="px-3 py-2 border rounded-lg"
                    disabled={!settings.openingHours[day].isOpen}
                  />
                  <span>-</span>
                  <input
                    type="time"
                    value={settings.openingHours[day].close}
                    onChange={(e) => handleUpdateHours(day, 'close', e.target.value)}
                    className="px-3 py-2 border rounded-lg"
                    disabled={!settings.openingHours[day].isOpen}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Bölgesel Ayarlar */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">Bölgesel Ayarlar</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Para Birimi
                </label>
                <select
                  value={settings.currency}
                  onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="TRY">Türk Lirası (₺)</option>
                  <option value="USD">Amerikan Doları ($)</option>
                  <option value="EUR">Euro (€)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dil
                </label>
                <select
                  value={settings.language}
                  onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="tr">Türkçe</option>
                  <option value="en">English</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Saat Dilimi
                </label>
                <select
                  value={settings.timeZone}
                  onChange={(e) => setSettings({ ...settings, timeZone: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="Europe/Istanbul">İstanbul (UTC+3)</option>
                  <option value="Europe/London">Londra (UTC+0)</option>
                  <option value="America/New_York">New York (UTC-5)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bildirim Ayarları */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">Bildirim Ayarları</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.notifications.email}
                  onChange={(e) => handleUpdateNotification('email', e.target.checked)}
                  className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                />
                <span>E-posta bildirimleri</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.notifications.sms}
                  onChange={(e) => handleUpdateNotification('sms', e.target.checked)}
                  className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                />
                <span>SMS bildirimleri</span>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
} 