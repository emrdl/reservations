'use client';
import { useState, useEffect } from 'react';
import { FiSearch, FiFilter, FiPlus, FiEdit2, FiTrash2, FiMail, FiPhone, FiCalendar } from 'react-icons/fi';

export default function CustomersPage() {
  const [isClient, setIsClient] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: ''
  });

  useEffect(() => {
    setIsClient(true);
    fetchCustomers();
  }, []);

  // Müşterileri getir
  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/users?role=CUSTOMER');
      if (!response.ok) throw new Error('Müşteriler alınamadı');
      const data = await response.json();
      setCustomers(data);
    } catch (error) {
      console.error('Müşteri listesi hatası:', error);
      // TODO: Hata bildirimi göster
    } finally {
      setLoading(false);
    }
  };

  // Yeni müşteri ekle
  const handleAddCustomer = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...formData,
          role: 'CUSTOMER'
        })
      });

      if (!response.ok) throw new Error('Müşteri eklenemedi');
      
      await fetchCustomers();
      setShowModal(false);
      setFormData({
        name: '',
        phone: '',
        email: '',
        address: '',
        notes: ''
      });
    } catch (error) {
      console.error('Müşteri ekleme hatası:', error);
      // TODO: Hata bildirimi göster
    }
  };

  // Müşteri güncelle
  const handleUpdateCustomer = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/users/${editingCustomer.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...formData,
          role: 'CUSTOMER'
        })
      });

      if (!response.ok) throw new Error('Müşteri güncellenemedi');
      
      await fetchCustomers();
      setShowModal(false);
      setEditingCustomer(null);
      setFormData({
        name: '',
        phone: '',
        email: '',
        address: '',
        notes: ''
      });
    } catch (error) {
      console.error('Müşteri güncelleme hatası:', error);
      // TODO: Hata bildirimi göster
    }
  };

  // Müşteri sil
  const handleDeleteCustomer = async (id) => {
    if (!window.confirm('Bu müşteriyi silmek istediğinizden emin misiniz?')) return;

    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Müşteri silinemedi');
      
      await fetchCustomers();
    } catch (error) {
      console.error('Müşteri silme hatası:', error);
      // TODO: Hata bildirimi göster
    }
  };

  // Müşterileri filtrele
  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isClient) {
    return null;
  }

  return (
    <div className="p-8">
      {/* Başlık */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Müşteri Yönetimi</h1>
          <p className="text-gray-500">Müşteri listesi ve detayları</p>
        </div>
        <button 
          onClick={() => {
            setEditingCustomer(null);
            setFormData({
              name: '',
              phone: '',
              email: '',
              address: '',
              notes: ''
            });
            setShowModal(true);
          }}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg flex items-center gap-2"
        >
          <FiPlus />
          Yeni Müşteri
        </button>
      </div>

      {/* Filtreler */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Müşteri ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
        </div>
        <button className="px-4 py-2 border rounded-lg flex items-center gap-2">
          <FiFilter />
          Filtrele
        </button>
      </div>

      {/* Müşteri Listesi */}
      <div className="bg-white rounded-lg border">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-4">Müşteri</th>
              <th className="text-left p-4">İletişim</th>
              <th className="text-left p-4">Adres</th>
              <th className="text-left p-4">Son Ziyaret</th>
              <th className="text-right p-4">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="p-4 text-center">Yükleniyor...</td>
              </tr>
            ) : filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-4 text-center">Müşteri bulunamadı</td>
              </tr>
            ) : (
              filteredCustomers.map((customer) => (
                <tr key={customer.id} className="border-b last:border-b-0 hover:bg-gray-50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        {customer.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium">{customer.name}</div>
                        <div className="text-sm text-gray-500">#{customer.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <FiMail className="text-gray-400" />
                        <span>{customer.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FiPhone className="text-gray-400" />
                        <span>{customer.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">{customer.address}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <FiCalendar className="text-gray-400" />
                      <span>{customer.lastVisit ? new Date(customer.lastVisit).toLocaleDateString('tr-TR') : '-'}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => {
                          setEditingCustomer(customer);
                          setFormData({
                            name: customer.name,
                            phone: customer.phone,
                            email: customer.email,
                            address: customer.address,
                            notes: customer.notes
                          });
                          setShowModal(true);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteCustomer(customer.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg text-red-500"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Sayfalama */}
      <div className="flex justify-between items-center mt-6">
        <div className="text-sm text-gray-500">
          Toplam {filteredCustomers.length} müşteri
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

      {/* Müşteri Ekleme/Düzenleme Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-semibold mb-4">
              {editingCustomer ? 'Müşteri Düzenle' : 'Yeni Müşteri'}
            </h2>
            <form onSubmit={editingCustomer ? handleUpdateCustomer : handleAddCustomer}>
              <div className="space-y-4">
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
                    Adres
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    rows={3}
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
                  onClick={() => {
                    setShowModal(false);
                    setEditingCustomer(null);
                    setFormData({
                      name: '',
                      phone: '',
                      email: '',
                      address: '',
                      notes: ''
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
                  {editingCustomer ? 'Güncelle' : 'Ekle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 