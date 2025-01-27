'use client';
import { useState, useEffect } from 'react';
import { FiSearch, FiFilter, FiPlus, FiEdit2, FiTrash2, FiClock, FiUser, FiCalendar } from 'react-icons/fi';

export default function ReservationsPage() {
  const [isClient, setIsClient] = useState(false);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('Tümü');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showModal, setShowModal] = useState(false);
  const [editingReservation, setEditingReservation] = useState(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    time: '19:00',
    guests: 2,
    name: '',
    phone: '',
    email: '',
    notes: '',
    status: 'PENDING'
  });

  const statuses = ['Tümü', 'Bekliyor', 'Onaylandı', 'İptal'];
  const statusMap = {
    'Bekliyor': 'PENDING',
    'Onaylandı': 'CONFIRMED',
    'İptal': 'CANCELLED'
  };

  useEffect(() => {
    setIsClient(true);
    fetchReservations();
  }, [selectedDate]);

  // Rezervasyonları getir
  const fetchReservations = async () => {
    try {
      const response = await fetch(`/api/reservations?date=${selectedDate}`);
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
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Rezervasyon eklenemedi');
      
      await fetchReservations();
      setShowModal(false);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        time: '19:00',
        guests: 2,
        name: '',
        phone: '',
        email: '',
        notes: '',
        status: 'PENDING'
      });
    } catch (error) {
      console.error('Rezervasyon ekleme hatası:', error);
      // TODO: Hata bildirimi göster
    }
  };

  // Rezervasyon güncelle
  const handleUpdateReservation = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/reservations/${editingReservation.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Rezervasyon güncellenemedi');
      
      await fetchReservations();
      setShowModal(false);
      setEditingReservation(null);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        time: '19:00',
        guests: 2,
        name: '',
        phone: '',
        email: '',
        notes: '',
        status: 'PENDING'
      });
    } catch (error) {
      console.error('Rezervasyon güncelleme hatası:', error);
      // TODO: Hata bildirimi göster
    }
  };

  // Rezervasyon sil
  const handleDeleteReservation = async (id) => {
    if (!window.confirm('Bu rezervasyonu silmek istediğinizden emin misiniz?')) return;

    try {
      const response = await fetch(`/api/reservations/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Rezervasyon silinemedi');
      
      await fetchReservations();
    } catch (error) {
      console.error('Rezervasyon silme hatası:', error);
      // TODO: Hata bildirimi göster
    }
  };

  // Rezervasyon durumu güncelle
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const response = await fetch(`/api/reservations/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) throw new Error('Rezervasyon durumu güncellenemedi');
      
      await fetchReservations();
    } catch (error) {
      console.error('Rezervasyon durumu güncelleme hatası:', error);
      // TODO: Hata bildirimi göster
    }
  };

  // Rezervasyonları filtrele
  const filteredReservations = reservations.filter(reservation => {
    const matchesSearch = 
      reservation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.phone.includes(searchTerm) ||
      reservation.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === 'Tümü' || reservation.status === statusMap[selectedStatus];
    
    return matchesSearch && matchesStatus;
  });

  // Durum rengini belirle
  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-600';
      case 'CONFIRMED':
        return 'bg-green-100 text-green-600';
      case 'CANCELLED':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  // Durum metnini belirle
  const getStatusText = (status) => {
    switch (status) {
      case 'PENDING':
        return 'Bekliyor';
      case 'CONFIRMED':
        return 'Onaylandı';
      case 'CANCELLED':
        return 'İptal';
      default:
        return status;
    }
  };

  if (!isClient) {
    return null;
  }

  return (
    <div className="p-8">
      {/* Başlık */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Rezervasyon Yönetimi</h1>
          <p className="text-gray-500">Rezervasyonları görüntüleyin ve yönetin</p>
        </div>
        <button 
          onClick={() => {
            setEditingReservation(null);
            setFormData({
              date: new Date().toISOString().split('T')[0],
              time: '19:00',
              guests: 2,
              name: '',
              phone: '',
              email: '',
              notes: '',
              status: 'PENDING'
            });
            setShowModal(true);
          }}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg flex items-center gap-2"
        >
          <FiPlus />
          Yeni Rezervasyon
        </button>
      </div>

      {/* Filtreler */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rezervasyon ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
        </div>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        />
        <button className="px-4 py-2 border rounded-lg flex items-center gap-2">
          <FiFilter />
          Filtrele
        </button>
      </div>

      {/* Durum Filtreleri */}
      <div className="flex gap-2 mb-6">
        {statuses.map((status) => (
          <button
            key={status}
            onClick={() => setSelectedStatus(status)}
            className={`px-4 py-2 rounded-lg ${
              status === selectedStatus
                ? 'bg-orange-50 text-orange-500'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Rezervasyon Listesi */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12">Yükleniyor...</div>
        ) : filteredReservations.length === 0 ? (
          <div className="text-center py-12">Rezervasyon bulunamadı</div>
        ) : (
          filteredReservations.map((reservation) => (
            <div key={reservation.id} className="bg-white rounded-lg border p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">Rezervasyon #{reservation.id}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(reservation.status)}`}>
                      {getStatusText(reservation.status)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <FiCalendar className="w-4 h-4" />
                      {new Date(reservation.date).toLocaleDateString('tr-TR')}
                    </span>
                    <span className="flex items-center gap-1">
                      <FiClock className="w-4 h-4" />
                      {reservation.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <FiUser className="w-4 h-4" />
                      {reservation.guests} Kişi
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => {
                      setEditingReservation(reservation);
                      setFormData({
                        date: reservation.date,
                        time: reservation.time,
                        guests: reservation.guests,
                        name: reservation.name,
                        phone: reservation.phone,
                        email: reservation.email,
                        notes: reservation.notes,
                        status: reservation.status
                      });
                      setShowModal(true);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <FiEdit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteReservation(reservation.id)}
                    className="p-2 hover:bg-gray-100 rounded-lg text-red-500"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Müşteri Bilgileri */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <div className="text-sm text-gray-500">Ad Soyad</div>
                  <div>{reservation.name}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Telefon</div>
                  <div>{reservation.phone}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">E-posta</div>
                  <div>{reservation.email}</div>
                </div>
              </div>

              {/* Rezervasyon Notları */}
              {reservation.notes && (
                <div className="mb-4">
                  <div className="text-sm text-gray-500">Notlar:</div>
                  <div>{reservation.notes}</div>
                </div>
              )}

              {/* Durum Güncelleme Butonları */}
              {reservation.status === 'PENDING' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdateStatus(reservation.id, 'CONFIRMED')}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg"
                  >
                    Onayla
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(reservation.id, 'CANCELLED')}
                    className="px-4 py-2 border border-red-500 text-red-500 rounded-lg"
                  >
                    İptal Et
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Sayfalama */}
      <div className="flex justify-between items-center mt-6">
        <div className="text-sm text-gray-500">
          Toplam {filteredReservations.length} rezervasyon
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 border rounded-lg" disabled>
            Önceki
          </button>
          <button className="px-4 py-2 border rounded-lg bg-orange-50 text-orange-600">
            1
          </button>
          <button className="px-4 py-2 border rounded-lg" disabled>
            Sonraki
          </button>
        </div>
      </div>

      {/* Rezervasyon Ekleme/Düzenleme Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-semibold mb-4">
              {editingReservation ? 'Rezervasyon Düzenle' : 'Yeni Rezervasyon'}
            </h2>
            <form onSubmit={editingReservation ? handleUpdateReservation : handleAddReservation}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tarih
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
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
                    onChange={(e) => setFormData({ ...formData, guests: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ad Soyad
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
                    E-posta
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                {editingReservation && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Durum
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                      required
                    >
                      {Object.entries(statusMap).map(([key, value]) => (
                        <option key={value} value={value}>
                          {key}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingReservation(null);
                    setFormData({
                      date: new Date().toISOString().split('T')[0],
                      time: '19:00',
                      guests: 2,
                      name: '',
                      phone: '',
                      email: '',
                      notes: '',
                      status: 'PENDING'
                    });
                  }}
                  className="px-4 py-2 border rounded-lg"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg"
                >
                  {editingReservation ? 'Güncelle' : 'Ekle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 