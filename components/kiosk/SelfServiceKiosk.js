'use client'
import { useState } from 'react'
import { BiCart, BiPlus, BiMinus, BiCreditCard } from 'react-icons/bi'

const CATEGORIES = ['Başlangıçlar', 'Ana Yemekler', 'Tatlılar', 'İçecekler']

export default function SelfServiceKiosk() {
  const [menu, setMenu] = useState([
    {
      id: 1,
      name: 'Mercimek Çorbası',
      description: 'Geleneksel Türk mercimek çorbası',
      price: 45,
      category: 'Başlangıçlar',
      image: '/mercimek.jpg'
    }
    // ... diğer ürünler
  ])

  const [cart, setCart] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0])

  const addToCart = (item) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id)
    if (existingItem) {
      setCart(cart.map(cartItem =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ))
    } else {
      setCart([...cart, { ...item, quantity: 1 }])
    }
  }

  const removeFromCart = (itemId) => {
    setCart(cart.filter(item => item.id !== itemId))
  }

  const updateQuantity = (itemId, delta) => {
    setCart(cart.map(item => {
      if (item.id === itemId) {
        const newQuantity = item.quantity + delta
        return newQuantity > 0
          ? { ...item, quantity: newQuantity }
          : null
      }
      return item
    }).filter(Boolean))
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <div className="h-screen flex">
      {/* Sol Panel - Menü */}
      <div className="flex-1 p-4 overflow-y-auto">
        {/* Kategori Seçimi */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {CATEGORIES.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full whitespace-nowrap ${
                selectedCategory === category
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Ürün Listesi */}
        <div className="grid grid-cols-2 gap-4">
          {menu
            .filter(item => item.category === selectedCategory)
            .map(item => (
              <div
                key={item.id}
                className="border rounded-lg p-4 hover:shadow-lg transition-shadow"
              >
                <div className="aspect-w-16 aspect-h-9 mb-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover rounded"
                  />
                </div>
                <h3 className="font-semibold">{item.name}</h3>
                <p className="text-sm text-gray-600 mb-2">
                  {item.description}
                </p>
                <div className="flex justify-between items-center">
                  <span className="font-bold">{item.price}₺</span>
                  <button
                    onClick={() => addToCart(item)}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    <BiPlus />
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Sağ Panel - Sepet */}
      <div className="w-96 bg-gray-50 p-4 border-l">
        <h2 className="font-bold text-xl mb-4">Sepetim</h2>
        
        {cart.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            Sepetiniz boş
          </div>
        ) : (
          <div className="space-y-4">
            {cart.map(item => (
              <div key={item.id} className="flex justify-between items-center">
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-sm text-gray-600">
                    {item.price}₺ x {item.quantity}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.id, -1)}
                    className="p-1 text-gray-600 hover:bg-gray-200 rounded"
                  >
                    <BiMinus />
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, 1)}
                    className="p-1 text-gray-600 hover:bg-gray-200 rounded"
                  >
                    <BiPlus />
                  </button>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-1 text-red-600 hover:bg-red-100 rounded"
                  >
                    <BiTrash />
                  </button>
                </div>
              </div>
            ))}

            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="font-bold">Toplam</span>
                <span className="font-bold text-xl">{total}₺</span>
              </div>
              <button
                onClick={() => {/* Ödeme işlemi */}}
                className="w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                <BiCreditCard className="inline-block mr-2" />
                Ödeme Yap
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 