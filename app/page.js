'use client'
import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="space-y-4">
        <Link href="/admin" className="block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
          Yönetim Paneli
        </Link>
        <Link href="/customer" className="block px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
          Müşteri Girişi
        </Link>
      </div>
    </main>
  )
} 