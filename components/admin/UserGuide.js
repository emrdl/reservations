'use client'
import { useState } from 'react'
import { BiBook, BiSearch, BiChevronRight } from 'react-icons/bi'

const GUIDE_SECTIONS = [
  {
    id: 'getting-started',
    title: 'Başlarken',
    content: `
      # Restoran Yönetim Sistemine Hoş Geldiniz

      Bu kılavuz, sistemimizi en verimli şekilde kullanmanıza yardımcı olacaktır.

      ## İlk Adımlar
      1. Giriş yapın
      2. Dashboard'u inceleyin
      3. Temel ayarları yapılandırın

      ## Önemli Özellikler
      - Rezervasyon yönetimi
      - Menü düzenleme
      - Sipariş takibi
      - Raporlama
    `
  },
  {
    id: 'reservations',
    title: 'Rezervasyonlar',
    content: `
      # Rezervasyon Yönetimi

      Rezervasyonları etkili bir şekilde yönetmek için:

      1. Takvim görünümünü kullanın
      2. Masa düzenini kontrol edin
      3. Müşteri bilgilerini kaydedin
      4. Özel notlar ekleyin
    `
  }
  // ... diğer bölümler
]

export default function UserGuide() {
  const [selectedSection, setSelectedSection] = useState(GUIDE_SECTIONS[0])
  const [searchQuery, setSearchQuery] = useState('')

  const filteredSections = GUIDE_SECTIONS.filter(section =>
    section.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* Sol Menü */}
      <div className="md:col-span-1 space-y-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <BiSearch className="absolute right-3 top-3 text-gray-400" />
        </div>

        <nav className="space-y-1">
          {filteredSections.map(section => (
            <button
              key={section.id}
              onClick={() => setSelectedSection(section)}
              className={`w-full text-left px-4 py-2 rounded ${
                selectedSection.id === section.id
                  ? 'bg-blue-50 text-blue-600'
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span>{section.title}</span>
                <BiChevronRight className={
                  selectedSection.id === section.id ? 'text-blue-600' : 'text-gray-400'
                } />
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* İçerik */}
      <div className="md:col-span-3">
        <div className="prose max-w-none">
          <div
            dangerouslySetInnerHTML={{
              __html: selectedSection.content
                .replace(/^#\s(.+)$/gm, '<h1>$1</h1>')
                .replace(/^##\s(.+)$/gm, '<h2>$1</h2>')
                .replace(/^-\s(.+)$/gm, '<li>$1</li>')
                .replace(/^\d\.\s(.+)$/gm, '<li>$1</li>')
                .split('\n').join('<br />')
            }}
          />
        </div>
      </div>
    </div>
  )
} 