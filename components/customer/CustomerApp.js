'use client'
import { useState } from 'react'
import { BiHome, BiHistory, BiUser, BiQr } from 'react-icons/bi'

const TABS = {
  HOME: 'home',
  ORDERS: 'orders',
  PROFILE: 'profile',
  QR: 'qr'
}

export default function CustomerApp() {
  const [activeTab, setActiveTab] = useState(TABS.HOME)
  const [user, setUser] = useState({
    name: 'Ahmet Yılmaz',
    points: 450,
    level: 'gold',
    favorites: ['Mercimek Çorbası', 'Izgara Köfte']
  })

  const [orderHistory, setOrderHistory] = useState([
    {
      id: 1,
      date: '2024-03-15',
      items: [
        { name: 'Mercimek Çorbası', quantity: 2, price: 45 },
        { name: 'Izgara Köfte', quantity: 1, price: 120 }
      ],
      total: 210,
      restaurant: 'Merkez Şube'
    }
    // ... diğer siparişler
  ])

  return (
    <div className="h-screen flex flex-col">
      {/* Ana İçerik */}
      <div className="flex-1 p-4">
        {activeTab === TABS.HOME && (
          <div className="space-y-6">
            {/* Kullanıcı Kartı */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg p-6 text-white">
              <h2 className="text-xl font-bold mb-2">Hoş geldin, {user.name}!</h2>
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm opacity-75">Puanların</div>
                  <div className="text-2xl font-bold">{user.points}</div>
                </div>
                <div>
                  <div className="text-sm opacity-75">Seviye</div>
                  <div className="text-2xl font-bold capitalize">{user.level}</div>
                </div>
              </div>
            </div>

            {/* Favori Menüler */}
            <div>
              <h3 className="font-semibold mb-3">Favorilerin</h3>
              <div className="grid grid-cols-2 gap-4">
                {user.favorites.map((item, index) => (
                  <div
                    key={index}
                    className="border rounded-lg p-4 text-center"
                  >
                    <div className="font-medium">{item}</div>
                    <button className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-full text-sm hover:bg-blue-600">
                      Sipariş Ver
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Özel Teklifler */}
            <div>
              <h3 className="font-semibold mb-3">Özel Teklifler</h3>
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">%20 İndirim</h4>
                      <p className="text-sm text-gray-600">
                        İlk siparişine özel indirim
                      </p>
                    </div>
                    <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                      Kullan
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === TABS.ORDERS && (
          <div className="space-y-4">
            {orderHistory.map(order => (
              <div key={order.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-medium">{order.restaurant}</div>
                    <div className="text-sm text-gray-600">
                      {new Date(order.date).toLocaleDateString()}
                    </div>
                  </div>
                  <span className="font-bold">{order.total}₺</span>
                </div>

                <div className="space-y-2">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{item.quantity}x {item.name}</span>
                      <span>{item.price}₺</span>
                    </div>
                  ))}
                </div>

                <button className="mt-4 w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                  Tekrar Sipariş Ver
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === TABS.PROFILE && (
          <div className="space-y-6">
            {/* Profil Bilgileri */}
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Kişisel Bilgiler</h3>
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm text-gray-600">Ad Soyad</label>
                    <input
                      type="text"
                      value={user.name}
                      className="w-full p-2 border rounded mt-1"
                    />
                  </div>
                  {/* ... diğer bilgiler */}
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Tercihler</h3>
                <div className="space-y-2">
                  {/* Tercihler */}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === TABS.QR && (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-center mb-4">
              <h3 className="font-semibold">QR Kod ile Ödeme</h3>
              <p className="text-sm text-gray-600">
                Masanızdaki QR kodu tarayın
              </p>
            </div>
            <div className="border-4 border-white rounded-lg p-4 bg-white shadow-lg">
              {/* QR kod tarayıcı */}
            </div>
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
              {value === TABS.HOME && <BiHome className="mx-auto" />}
              {value === TABS.ORDERS && <BiHistory className="mx-auto" />}
              {value === TABS.PROFILE && <BiUser className="mx-auto" />}
              {value === TABS.QR && <BiQr className="mx-auto" />}
              <span className="text-xs mt-1">{key}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
} 