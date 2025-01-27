'use client';
import { useState, useEffect } from 'react';

export default function TableForm({ table, sections, onSubmit, onDelete, onClose }) {
  const [formData, setFormData] = useState({
    number: '',
    name: '',
    capacity: 4,
    section: 'MAIN',
    status: 'EMPTY',
    positionX: 100,
    positionY: 100,
  });

  useEffect(() => {
    if (table) {
      setFormData({
        id: table.id,
        number: table.number,
        name: table.name,
        capacity: table.capacity,
        section: table.section,
        status: table.status,
        positionX: table.positionX,
        positionY: table.positionY,
      });
    }
  }, [table]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-xl font-bold mb-4">
          {table ? 'Masa Düzenle' : 'Yeni Masa Ekle'}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-1">Masa Numarası</label>
            <input
              type="number"
              value={formData.number}
              onChange={(e) => setFormData({ ...formData, number: parseInt(e.target.value) })}
              className="w-full border p-2 rounded"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1">Masa Adı</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border p-2 rounded"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1">Kapasite</label>
            <input
              type="number"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
              className="w-full border p-2 rounded"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1">Bölge</label>
            <select
              value={formData.section}
              onChange={(e) => setFormData({ ...formData, section: e.target.value })}
              className="w-full border p-2 rounded"
              required
            >
              {sections.map((section) => (
                <option key={section.id} value={section.name}>
                  {section.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block mb-1">Durum</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full border p-2 rounded"
              required
            >
              <option value="EMPTY">Boş</option>
              <option value="RESERVED">Rezerve</option>
              <option value="OCCUPIED">Dolu</option>
            </select>
          </div>

          <div className="flex justify-end gap-2">
            {table && (
              <button
                type="button"
                onClick={() => onDelete(table.id)}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Sil
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              İptal
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              {table ? 'Güncelle' : 'Ekle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 