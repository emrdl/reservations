'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FiHome, FiCalendar, FiGrid, FiUsers, FiSettings, FiMenu, FiX, FiBell, FiUser, FiLogOut } from 'react-icons/fi'

export default function AdminLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const pathname = usePathname()

  const menuItems = [
    { name: 'Ana Sayfa', icon: FiHome, href: '/admin' },
    { name: 'Rezervasyonlar', icon: FiCalendar, href: '/admin/reservations' },
    { name: 'Masa Düzeni', icon: FiGrid, href: '/admin/tables' },
    { name: 'Müşteriler', icon: FiUsers, href: '/admin/customers' },
    { name: 'Ayarlar', icon: FiSettings, href: '/admin/settings' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Üst Menü Bar */}
      <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-blue-800 h-16 z-50">
        <div className="max-w-7xl mx-auto px-4 h-full">
          <div className="flex items-center justify-between h-full">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
            </div>

            {/* Ana Menü */}
            <nav className="hidden md:flex space-x-1 h-full">
              {menuItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-4 h-full border-b-2 transition-colors ${
                      isActive
                        ? 'border-white text-white'
                        : 'border-transparent text-blue-100 hover:text-white hover:border-blue-300'
                    }`}
                  >
                    <item.icon className="w-5 h-5 mr-2" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </nav>

            {/* Sağ Kısım */}
            <div className="flex items-center space-x-4">
              <button className="p-2 text-blue-100 hover:text-white relative">
                <FiBell className="w-6 h-6" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              <div className="relative">
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center space-x-3 p-2 text-blue-100 hover:text-white"
                >
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                    <FiUser className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium">Admin</span>
                </button>

                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2">
                    <Link href="/admin/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <FiUser className="w-4 h-4 mr-2" />
                      Profil
                    </Link>
                    <button className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                      <FiLogOut className="w-4 h-4 mr-2" />
                      Çıkış Yap
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobil Menü */}
      <div className="md:hidden">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="fixed top-4 right-4 z-50 p-2 rounded-md bg-blue-700 text-white shadow-lg"
        >
          {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>

        {/* Mobil Menü İçeriği */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-40 bg-blue-800 bg-opacity-95">
            <nav className="flex flex-col items-center justify-center h-full space-y-8">
              {menuItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-2 text-lg ${
                      isActive ? 'text-white' : 'text-blue-100 hover:text-white'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <item.icon className="w-6 h-6" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </nav>
          </div>
        )}
      </div>

      {/* Ana İçerik */}
      <main className="pt-16 min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto p-6">
          {children}
        </div>
      </main>
    </div>
  )
} 