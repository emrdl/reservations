'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { FiHome, FiCalendar, FiGrid, FiMenu, FiShoppingCart, FiDollarSign, FiUsers, FiUserCheck, FiBox, FiTrendingUp, FiMessageSquare, FiBell, FiPieChart, FiCoffee, FiTruck, FiCalendarPlus, FiSettings, FiInfo, FiBarChart2, FiBook, FiLink, FiGitBranch, FiActivity, FiTarget, FiTag, FiShare2, FiChevronLeft, FiChevronRight } from 'react-icons/fi'

export default function AdminNavbar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  
  const mainMenuItems = [
    { name: 'Dashboard', path: '/admin', icon: FiHome },
    { name: 'Takvim', path: '/admin/calendar', icon: FiCalendar },
    { name: 'Masa Düzeni', path: '/admin/layout', icon: FiGrid },
    { name: 'Müşteriler', path: '/admin/customers', icon: FiUsers },
  ]

  const settingsMenuItems = [
    { name: 'Ayarlar', path: '/admin/settings', icon: FiSettings },
  ]

  return (
    <div className={`bg-white border-r border-gray-200 min-h-screen fixed left-0 top-0 overflow-y-auto transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}>
      <div className="p-4">
        {/* Collapse Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="mb-6 p-2 rounded-lg hover:bg-gray-100 absolute right-2 top-2"
        >
          {isCollapsed ? <FiChevronRight className="w-5 h-5" /> : <FiChevronLeft className="w-5 h-5" />}
        </button>

        {/* Ana Menü */}
        <div className="mb-8 mt-8">
          <p className={`text-xs text-gray-500 mb-3 ${isCollapsed ? 'hidden' : ''}`}>ANA MENÜ</p>
          <div className="space-y-1">
            {mainMenuItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
                    pathname === item.path
                      ? 'bg-orange-50 text-orange-500'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                  title={isCollapsed ? item.name : ''}
                >
                  <Icon className="w-5 h-5" />
                  {!isCollapsed && item.name}
                </Link>
              )
            })}
          </div>
        </div>

        {/* Ayarlar Menü */}
        <div>
          <p className={`text-xs text-gray-500 mb-3 ${isCollapsed ? 'hidden' : ''}`}>AYARLAR</p>
          <div className="space-y-1">
            {settingsMenuItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
                    pathname === item.path
                      ? 'bg-orange-50 text-orange-500'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                  title={isCollapsed ? item.name : ''}
                >
                  <Icon className="w-5 h-5" />
                  {!isCollapsed && item.name}
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
} 