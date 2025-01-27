'use client'
import { useState, useEffect } from 'react'
import { BiAlarm, BiPhone, BiEnvelope } from 'react-icons/bi'

export default function ReservationReminders() {
  const [reminders, setReminders] = useState([
    {
      id: 1,
      reservationId: 'R123',
      customerName: 'Ali Yılmaz',
      date: '2024-03-20',
      time: '19:00',
      phone: '5551234567',
      email: 'ali@example.com',
      reminded: false,
      confirmationStatus: 'pending'
    }
    // ... diğer hatırlatmalar
  ])

  const sendReminder = async (reminder) => {
    // SMS/Email gönderme simülasyonu
    await new Promise(resolve => setTimeout(resolve, 1000))
    setReminders(reminders.map(r =>
      r.id === reminder.id ? { ...r, reminded: true } : r
    ))
  }

  const updateConfirmation = (reminderId, status) => {
    setReminders(reminders.map(r =>
      r.id === reminderId ? { ...r, confirmationStatus: status } : r
    ))
  }

  return (
    <div className="space-y-4">
      {/* Yaklaşan Rezervasyonlar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reminders.map(reminder => (
          <div key={reminder.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-medium">{reminder.customerName}</h4>
                <div className="text-sm text-gray-600">
                  {new Date(reminder.date).toLocaleDateString()} - {reminder.time}
                </div>
              </div>
              <div className={`px-2 py-1 rounded text-sm ${
                reminder.confirmationStatus === 'confirmed' ? 'bg-green-100 text-green-800' :
                reminder.confirmationStatus === 'cancelled' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {reminder.confirmationStatus === 'confirmed' ? 'Onaylandı' :
                 reminder.confirmationStatus === 'cancelled' ? 'İptal' :
                 'Beklemede'}
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <BiPhone className="text-gray-500" />
                {reminder.phone}
              </div>
              <div className="flex items-center gap-2">
                <BiEnvelope className="text-gray-500" />
                {reminder.email}
              </div>
            </div>

            <div className="mt-4 space-x-2">
              {!reminder.reminded && (
                <button
                  onClick={() => sendReminder(reminder)}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Hatırlatma Gönder
                </button>
              )}
              {reminder.confirmationStatus === 'pending' && (
                <>
                  <button
                    onClick={() => updateConfirmation(reminder.id, 'confirmed')}
                    className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Onayla
                  </button>
                  <button
                    onClick={() => updateConfirmation(reminder.id, 'cancelled')}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    İptal
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 