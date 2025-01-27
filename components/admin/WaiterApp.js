'use client'
import { useState } from 'react'
import { BiTable, BiDish, BiReceipt, BiUser } from 'react-icons/bi'

const TABS = {
  TABLES: 'tables',
  ORDERS: 'orders',
  PAYMENTS: 'payments',
  PROFILE: 'profile'
}

export default function WaiterApp() {
  const [activeTab, setActiveTab] = useState(TABS.TABLES)
  const [tables, setTables] = useState([
    {
      id: 'M1',
      status: 'occupied',
      customers: 4,
      orderTotal: 450,
      orderTime: '2024-03-15T10:00:00Z'
    }
    // ... diğer masalar
  ])

  const [orders, setOrders] = useState([
    {
      id: 1,
      tableId: 'M1',
      items: [
        { name: 'Mercimek Çorbası', quantity: 2, price: 45 },
        { name: 'Izgara Köfte', quantity: 1, price: 120 }
      ],
      status: 'active',
      total: 210
    }
    // ... diğer siparişler
  ])

  return (
    <div className="h-screen flex flex-col">
      {/* Ana İçerik */}
      <div className="flex-1 p-4">
        {activeTab === TABS.TABLES && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {tables.map(table => (
              <div
                key={table.id}
                className={`border rounded-lg p-4 ${
                  table.status === 'occupied' ? 'bg-red-50' : 'bg-green-50'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold">Masa {table.id}</h3>
                  <span className={`px-2 py-1 rounded-full text-sm ${
                    table.status === 'occupied'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {table.status === 'occupied' ? 'Dolu' : 'Boş'}
                  </span>
                </div>

                {table.status === 'occupied' && (
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Müşteri</span>
                      <span>{table.customers} kişi</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Toplam</span>
                      <span>{table.orderTotal}₺</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Süre</span>
                      <span>
                        {Math.round(
                          (new Date() - new Date(table.orderTime)) / 1000 / 60
                        )} dk
                      </span>
                    </div>
                  </div>
                )}

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => {/* Sipariş alma */}}
                    className="flex-1 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Sipariş
                  </button>
                  <button
                    onClick={() => {/* Hesap alma */}}
                    className="flex-1 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Hesap
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === TABS.ORDERS && (
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold">Masa {order.tableId}</h3>
                    <span className="text-sm text-gray-600">
                      Sipariş #{order.id}
                    </span>
                  </div>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {order.status}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between">
                      <span>
                        {item.quantity}x {item.name}
                      </span>
                      <span>{item.price}₺</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center border-t pt-2">
                  <span className="font-bold">Toplam: {order.total}₺</span>
                  <button
                    onClick={() => {/* Sipariş detayı */}}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Detaylar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === TABS.PAYMENTS && (
          <div className="space-y-4">
            {/* Ödeme işlemleri */}
          </div>
        )}

        {activeTab === TABS.PROFILE && (
          <div className="space-y-4">
            {/* Profil bilgileri */}
          </div>
        )}
      </div>

      {/* Alt Menü */}
      <div className="bg-white border-t">
        <div className="flex justify-around">
          {Object.entries(TABS).map(([key, value]) => (
            <button
              key={key}
              onClick={() => setActiveTab(value)}
              className={`flex-1 py-4 text-center ${
                activeTab === value
                  ? 'text-blue-600 border-t-2 border-blue-600'
                  : 'text-gray-600'
              }`}
            >
              {value === TABS.TABLES && <BiTable className="mx-auto" />}
              {value === TABS.ORDERS && <BiDish className="mx-auto" />}
              {value === TABS.PAYMENTS && <BiReceipt className="mx-auto" />}
              {value === TABS.PROFILE && <BiUser className="mx-auto" />}
              <span className="text-xs mt-1">{key}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
} 