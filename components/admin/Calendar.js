'use client'
import { useState } from 'react'

export default function Calendar() {
  const [selectedDate, setSelectedDate] = useState(new Date())

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">
        Rezervasyon Takvimi
      </h2>
      <div className="bg-gray-100 p-4 rounded">
        <p className="text-gray-600">
          Tarih: {selectedDate.toLocaleDateString()}
        </p>
      </div>
    </div>
  )
} 