'use client';
import { useState, useEffect } from 'react';
import { FiCalendar, FiClock, FiUser, FiUsers, FiChevronLeft, FiChevronRight, FiX } from 'react-icons/fi';

export default function CalendarPage() {
  const [isClient, setIsClient] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    guests: '',
    name: '',
    phone: '',
    notes: ''
  });

  useEffect(() => {
    setIsClient(true);
    fetchReservations();
  }, [selectedDate]);

  // Rezervasyonları getir
  const fetchReservations = async () => {
    try {
      const response = await fetch(`/api/reservations?date=${selectedDate.toISOString()}`);
      if (!response.ok) throw new Error('Rezervasyonlar alınamadı');
      const data = await response.json();
      setReservations(data);
    } catch (error) {
      console.error('Rezervasyon listesi hatası:', error);
      // TODO: Hata bildirimi göster
    } finally {
      setLoading(false);
    }
  };

  // Yeni rezervasyon ekle
  const handleAddReservation = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...formData,
          date: selectedDate.toISOString()
        })
      });

      if (!response.ok) throw new Error('Rezervasyon eklenemedi');
      
      await fetchReservations();
      setShowModal(false);
      setFormData({
        date: '',
        time: '',
        guests: '',
        name: '',
        phone: '',
        notes: ''
      });
    } catch (error) {
      console.error('Rezervasyon ekleme hatası:', error);
      // TODO: Hata bildirimi göster
    }
  };

  // Rezervasyon durumunu güncelle
  const handleUpdateStatus = async (id, status) => {
    try {
      const response = await fetch(`/api/reservations`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ id, status })
      });

      if (!response.ok) throw new Error('Rezervasyon güncellenemedi');
      
      await fetchReservations();
    } catch (error) {
      console.error('Rezervasyon güncelleme hatası:', error);
      // TODO: Hata bildirimi göster
    }
  };

  // Rezervasyon sil
  const handleDeleteReservation = async (id) => {
    if (!window.confirm('Bu rezervasyonu silmek istediğinizden emin misiniz?')) return;

    try {
      const response = await fetch(`/api/reservations`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ id })
      });

      if (!response.ok) throw new Error('Rezervasyon silinemedi');
      
      await fetchReservations();
    } catch (error) {
      console.error('Rezervasyon silme hatası:', error);
      // TODO: Hata bildirimi göster
    }
  };

  // Ay başlangıç ve bitiş günlerini hesapla
  const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  
  // Takvim günlerini oluştur
  const days = [];
  const startDay = startOfMonth.getDay();
  
  // Önceki ayın günlerini ekle
  for (let i = 0; i < startDay; i++) {
    const prevDate = new Date(startOfMonth);
    prevDate.setDate(prevDate.getDate() - (startDay - i));
    days.push({ date: prevDate, isCurrentMonth: false });
  }
  
  // Mevcut ayın günlerini ekle
  for (let i = 1; i <= endOfMonth.getDate(); i++) {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i);
    days.push({ date, isCurrentMonth: true });
  }
  
  // Sonraki ayın günlerini ekle
  const remainingDays = 42 - days.length; // 6 satır x 7 gün = 42
  for (let i = 1; i <= remainingDays; i++) {
    const nextDate = new Date(endOfMonth);
    nextDate.setDate(nextDate.getDate() + i);
    days.push({ date: nextDate, isCurrentMonth: false });
  }

  const weekDays = ['Pzr', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const isSelected = (date) => {
    return date.getDate() === selectedDate.getDate() &&
           date.getMonth() === selectedDate.getMonth() &&
           date.getFullYear() === selectedDate.getFullYear();
  };

  if (!isClient) {
    return null;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Rezervasyon Takvimi</h1>
          <p className="text-gray-500">Günlük rezervasyonları görüntüleyin ve yönetin</p>
        </div>
        <button 
          onClick={() => {
            setFormData({
              date: '',
              time: '',
              guests: '',
              name: '',
              phone: '',
              notes: ''
            });
            setShowModal(true);
          }}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg flex items-center gap-2"
        >
          <FiCalendar />
          Yeni Rezervasyon
        </button>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {/* Takvim */}
        <div className="col-span-3 bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">
              {currentMonth.toLocaleString('tr-TR', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex items-center gap-4">
              <button
                onClick={handlePrevMonth}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <FiChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <FiChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-4">
            {/* Haftanın günleri */}
            {weekDays.map((day) => (
              <div key={day} className="text-center text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}
            
            {/* Takvim günleri */}
            {days.map(({ date, isCurrentMonth }, index) => (
              <button
                key={index}
                onClick={() => setSelectedDate(date)}
                className={`
                  p-2 rounded-lg text-center relative
                  ${isCurrentMonth ? 'hover:bg-orange-50' : 'text-gray-400'}
                  ${isToday(date) ? 'bg-orange-50' : ''}
                  ${isSelected(date) ? 'bg-orange-500 text-white hover:bg-orange-600' : ''}
                `}
              >
                <span className="text-sm">{date.getDate()}</span>
                {/* Rezervasyon göstergesi */}
                {reservations.some(r => new Date(r.date).getDate() === date.getDate()) && (
                  <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                    <div className="w-1 h-1 bg-orange-500 rounded-full"></div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Günlük Rezervasyonlar */}
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="font-semibold mb-4">
            {selectedDate.toLocaleDateString('tr-TR', { 
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </h3>
          <div className="space-y-4">
            {loading ? (
              <div>Yükleniyor...</div>
            ) : reservations.length === 0 ? (
              <div className="text-gray-500">Bu güne ait rezervasyon bulunmuyor</div>
            ) : (
              reservations.map((reservation) => (
                <div 
                  key={reservation.id}
                  className="p-4 rounded-lg border hover:border-orange-500 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <FiClock className="text-gray-400" />
                      <span className="font-medium">{reservation.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        reservation.status === 'CONFIRMED' 
                          ? 'bg-green-100 text-green-600'
                          : 'bg-yellow-100 text-yellow-600'
                      }`}>
                        {reservation.status === 'CONFIRMED' ? 'Onaylandı' : 'Beklemede'}
                      </span>
                      <button
                        onClick={() => handleDeleteReservation(reservation.id)}
                        className="p-1 hover:bg-red-50 rounded-full text-red-500"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <FiUser className="text-gray-400" />
                    <span>{reservation.name}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <FiUsers className="text-gray-400" />
                      <span>{reservation.guests} Kişi</span>
                    </div>
                    <div className="flex gap-2">
                      {reservation.status === 'PENDING' && (
                        <button
                          onClick={() => handleUpdateStatus(reservation.id, 'CONFIRMED')}
                          className="px-2 py-1 bg-green-500 text-white rounded-lg text-xs"
                        >
                          Onayla
                        </button>
                      )}
                      <button
                        onClick={() => handleUpdateStatus(reservation.id, 'CANCELLED')}
                        className="px-2 py-1 bg-red-500 text-white rounded-lg text-xs"
                      >
                        İptal Et
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Rezervasyon Ekleme Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-semibold mb-4">Yeni Rezervasyon</h2>
            <form onSubmit={handleAddReservation}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Saat
                  </label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kişi Sayısı
                  </label>
                  <input
                    type="number"
                    value={formData.guests}
                    onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Müşteri Adı
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notlar
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-lg"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg"
                >
                  Ekle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 