'use client'
import { useState, useEffect } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import DraggableTable from './DraggableTable'
import TableForm from './TableForm'

export default function TableLayout() {
  const [tables, setTables] = useState([])
  const [sections, setSections] = useState([])
  const [selectedTable, setSelectedTable] = useState(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Masaları getir
  const fetchTables = async () => {
    try {
      const response = await fetch('/api/tables/layout')
      if (!response.ok) throw new Error('Masalar yüklenirken hata oluştu')
      const data = await response.json()
      setTables(data)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Bölgeleri getir
  const fetchSections = async () => {
    try {
      const response = await fetch('/api/sections')
      if (!response.ok) throw new Error('Bölgeler yüklenirken hata oluştu')
      const data = await response.json()
      setSections(data)
    } catch (err) {
      setError(err.message)
    }
  }

  useEffect(() => {
    fetchTables()
    fetchSections()
  }, [])

  // Masa pozisyonunu güncelle
  const handleTableMove = async (id, positionX, positionY) => {
    try {
      const response = await fetch('/api/tables/layout', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, positionX, positionY })
      })

      if (!response.ok) throw new Error('Masa pozisyonu güncellenemedi')
      await fetchTables() // Masaları yeniden yükle
    } catch (err) {
      setError(err.message)
    }
  }

  // Yeni masa ekle
  const handleAddTable = async (tableData) => {
    try {
      const response = await fetch('/api/tables/layout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tableData)
      })

      if (!response.ok) throw new Error('Masa eklenemedi')
      await fetchTables()
      setIsFormOpen(false)
    } catch (err) {
      setError(err.message)
    }
  }

  // Masa güncelle
  const handleUpdateTable = async (tableData) => {
    try {
      const response = await fetch('/api/tables/layout', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tableData)
      })

      if (!response.ok) throw new Error('Masa güncellenemedi')
      await fetchTables()
      setSelectedTable(null)
      setIsFormOpen(false)
    } catch (err) {
      setError(err.message)
    }
  }

  // Masa sil
  const handleDeleteTable = async (id) => {
    if (!confirm('Bu masayı silmek istediğinizden emin misiniz?')) return

    try {
      const response = await fetch('/api/tables/layout', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })

      if (!response.ok) throw new Error('Masa silinemedi')
      await fetchTables()
      setSelectedTable(null)
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) return <div>Yükleniyor...</div>
  if (error) return <div className="text-red-500">Hata: {error}</div>

  return (
    <div className="p-4">
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Masa Düzeni</h1>
        <button
          onClick={() => {
            setSelectedTable(null)
            setIsFormOpen(true)
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Yeni Masa Ekle
        </button>
      </div>

      <DndProvider backend={HTML5Backend}>
        <div className="relative w-full h-[600px] border border-gray-300 rounded">
          {tables.map((table) => (
            <DraggableTable
              key={table.id}
              table={table}
              onMove={handleTableMove}
              onClick={() => {
                setSelectedTable(table)
                setIsFormOpen(true)
              }}
            />
          ))}
        </div>
      </DndProvider>

      {isFormOpen && (
        <TableForm
          table={selectedTable}
          sections={sections}
          onSubmit={selectedTable ? handleUpdateTable : handleAddTable}
          onDelete={selectedTable ? handleDeleteTable : null}
          onClose={() => {
            setIsFormOpen(false)
            setSelectedTable(null)
          }}
        />
      )}
    </div>
  )
} 