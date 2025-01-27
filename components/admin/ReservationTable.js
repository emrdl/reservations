'use client'
import { useState } from 'react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

const mockReservations = [
  {
    id: 1,
    name: 'Ahmet Yılmaz',
    date: new Date(),
    time: '12:00',
    persons: 4,
    status: 'pending',
    valet: true,
    seating: 'window',
    phone: '5551234567',
    email: 'ahmet@example.com'
  },
  // Daha fazla mock veri eklenebilir
]

export default function ReservationTable() {
  const [filter, setFilter] = useState({
    status: 'all',
    date: '',
  })
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const filteredReservations = mockReservations.filter(reservation => {
    if (filter.status !== 'all' && reservation.status !== filter.status) return false
    if (filter.date && format(reservation.date, 'yyyy-MM-dd') !== filter.date) return false
    return true
  })

  const totalPages = Math.ceil(filteredReservations.length / itemsPerPage)
  const currentItems = filteredReservations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleStatusChange = async (id, newStatus) => {
    // API çağrısı yapılacak
    console.log(`Rezervasyon ${id} durumu ${newStatus} olarak güncellendi`)
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4 mb-4">
        <select
          value={filter.status}
          onChange={(e) => setFilter({...filter, status: e.target.value})}
          className="p-2 border rounded"
        >
          <option value="all">Tüm Durumlar</option>
          <option value="pending">Bekleyen</option>
          <option value="approved">Onaylı</option>
          <option value="rejected">Reddedildi</option>
        </select>

        <input
          type="date"
          value={filter.date}
          onChange={(e) => setFilter({...filter, date: e.target.value})}
          className="p-2 border rounded"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 text-left">Tarih/Saat</th>
              <th className="p-3 text-left">İsim</th>
              <th className="p-3 text-left">Kişi</th>
              <th className="p-3 text-left">Tercihler</th>
              <th className="p-3 text-left">İletişim</th>
              <th className="p-3 text-left">Durum</th>
              <th className="p-3 text-left">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((reservation) => (
              <tr key={reservation.id} className="border-t">
                <td className="p-3">
                  {format(reservation.date, 'dd MMMM yyyy', { locale: tr })}
                  <br />
                  {reservation.time}
                </td>
                <td className="p-3">{reservation.name}</td>
                <td className="p-3">{reservation.persons} kişi</td>
                <td className="p-3">
                  {reservation.valet && '🚗 Vale'}
                  {reservation.seating === 'window' && '🪟 Pencere Kenarı'}
                  {reservation.seating === 'middle' && '📍 Orta Alan'}
                </td>
                <td className="p-3">
                  {reservation.phone}<br />
                  {reservation.email}
                </td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-sm ${
                    reservation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    reservation.status === 'approved' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {reservation.status === 'pending' ? 'Bekliyor' :
                     reservation.status === 'approved' ? 'Onaylı' : 'Reddedildi'}
                  </span>
                </td>
                <td className="p-3">
                  {reservation.status === 'pending' && (
                    <div className="space-x-2">
                      <button
                        onClick={() => handleStatusChange(reservation.id, 'approved')}
                        className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        Onayla
                      </button>
                      <button
                        onClick={() => handleStatusChange(reservation.id, 'rejected')}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Reddet
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center space-x-2 mt-4">
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index + 1)}
              className={`px-3 py-1 rounded ${
                currentPage === index + 1
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  )
} 