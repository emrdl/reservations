'use client';

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import AdminLayout from '@/components/admin/AdminLayout';
import { toast } from 'react-hot-toast';
import axiosInstance from '@/services/axiosService';
import DataTable from 'react-data-table-component';
import { Menu } from '@headlessui/react';
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';

const TableLayout = () => {
  const svgRef = useRef(null);
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedSection, setSelectedSection] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTableData, setNewTableData] = useState({
    name: '',
    number: '',
    capacity: 4,
    status: 'EMPTY'
  });
  const [sections, setSections] = useState([]);
  const [showTableList, setShowTableList] = useState(false);
  const [showSectionList, setShowSectionList] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [newSection, setNewSection] = useState({
    name: '',
    colorCode: '#3B82F6'
  });

  // Masaları getir
  const fetchTables = async () => {
    try {
      const response = await fetch('/api/tables/layout');
      if (!response.ok) {
        throw new Error('Masalar getirilemedi');
      }
      const data = await response.json();
      console.log('Gelen masa verileri:', data);
      setTables(data);
    } catch (error) {
      console.error('Masa getirme hatası:', error);
      toast.error('Masalar yüklenirken bir hata oluştu');
    }
  };

  // Bölgeleri getir
  const fetchSections = async () => {
    try {
      const data = await axiosInstance.get('/sections');
      setSections(data);
    } catch (error) {
      console.error('Bölge listesi hatası:', error);
      toast.error('Bölgeler yüklenirken bir hata oluştu');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Bölgeleri ve masaları paralel olarak yükle
        const [tablesResponse, sectionsResponse] = await Promise.all([
          fetch('/api/tables/layout'),
          fetch('/api/sections')
        ]);

        if (!tablesResponse.ok || !sectionsResponse.ok) {
          throw new Error('Veriler getirilemedi');
        }

        const tablesData = await tablesResponse.json();
        const sectionsData = await sectionsResponse.json();
        
        console.log('Gelen masa verileri:', tablesData);
        console.log('Gelen bölge verileri:', sectionsData);
        
        if (Array.isArray(sectionsData) && sectionsData.length > 0) {
          setSections(sectionsData);
          // İlk bölgeyi seç
          setSelectedSection(sectionsData[0].id);
        }
        
        if (Array.isArray(tablesData)) {
          setTables(tablesData);
        }

        setLoading(false);
      } catch (error) {
        console.error('Veri yükleme hatası:', error);
        toast.error('Veriler yüklenirken bir hata oluştu');
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Filtrelenmiş masaları güncelleyelim
  const filteredTables = tables.filter(table => {
    // Bölge seçili değilse tüm masaları göster
    if (!selectedSection) return true;
    
    // Bölge filtresi
    const section = sections.find(s => s.id === selectedSection);
    if (!section) return true;
    
    if (table.section !== section.name) {
      return false;
    }
    
    // Durum filtresi
    if (filter === 'all') return true;
    return table.status === filter.toUpperCase();
  });

  useEffect(() => {
    if (!svgRef.current || loading) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 800;
    const height = 700;

    // Seçili bölgenin arka plan rengini bul ve açık tona çevir
    const selectedSectionColor = sections.find(s => s.id === selectedSection)?.colorCode || '#f9fafb';
    const lightColor = d3.color(selectedSectionColor).brighter(1.5).toString();

    svg
      .attr('width', width)
      .attr('height', height)
      .style('border', '1px solid #ccc')
      .style('background', lightColor);

    // Grid çizgilerini ekle
    const gridSize = 50;
    const gridLines = svg.append('g').attr('class', 'grid-lines');

    // Yatay çizgiler
    for (let y = 0; y <= height; y += gridSize) {
      gridLines.append('line')
        .attr('x1', 0)
        .attr('y1', y)
        .attr('x2', width)
        .attr('y2', y)
        .style('stroke', '#e5e7eb')
        .style('stroke-width', 1);
    }

    // Dikey çizgiler
    for (let x = 0; x <= width; x += gridSize) {
      gridLines.append('line')
        .attr('x1', x)
        .attr('y1', 0)
        .attr('x2', x)
        .attr('y2', height)
        .style('stroke', '#e5e7eb')
        .style('stroke-width', 1);
    }

    // Sürükle-bırak işlevselliği
    const drag = d3.drag()
      .on('start', dragStarted)
      .on('drag', dragged)
      .on('end', dragEnded)
      .subject(function(event, d) {
        return {
          x: d.positionX,
          y: d.positionY
        };
      });

    function dragStarted(event, d) {
      const currentElement = d3.select(this);
      currentElement.raise();
      d.dragStartX = event.x - d.positionX;
      d.dragStartY = event.y - d.positionY;
    }

    function dragged(event, d) {
      const newX = event.x - d.dragStartX;
      const newY = event.y - d.dragStartY;
      d.positionX = newX;
      d.positionY = newY;
      d3.select(this)
        .attr('transform', `translate(${newX},${newY})`);
    }

    async function dragEnded(event, d) {
      d3.select(this).classed('active', false);
      try {
        await fetch('/api/tables/layout', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: d.id,
            positionX: Math.round(d.positionX),
            positionY: Math.round(d.positionY)
          })
        });
        
        // State'i güncelle
        setTables(prevTables => 
          prevTables.map(table => 
            table.id === d.id 
              ? { ...table, positionX: d.positionX, positionY: d.positionY }
              : table
          )
        );
      } catch (error) {
        console.error('Masa konumu güncelleme hatası:', error);
        toast.error('Masa konumu güncellenirken bir hata oluştu');
      }
    }

    // Sandalyeleri güncelleyen fonksiyon
    function updateChairs(table, width, height, capacity) {
      // Önce mevcut sandalyeleri temizle
      table.selectAll('.chair').remove();

      const chairs = [];
      const radius = 4;
      
      // Üst kısım
      const topChairs = Math.min(Math.ceil(capacity / 4), Math.floor(width / 20));
      for (let i = 0; i < topChairs; i++) {
        chairs.push({
          x: (width / (topChairs + 1)) * (i + 1),
          y: -10
        });
      }
      
      // Alt kısım
      const bottomChairs = topChairs;
      for (let i = 0; i < bottomChairs; i++) {
        chairs.push({
          x: (width / (bottomChairs + 1)) * (i + 1),
          y: height + 10
        });
      }
      
      // Kalan sandalyeler
      const remainingChairs = capacity - (topChairs + bottomChairs);
      const sideChairsEach = Math.ceil(remainingChairs / 2);
      
      // Sol kısım
      for (let i = 0; i < sideChairsEach && chairs.length < capacity; i++) {
        chairs.push({
          x: -10,
          y: (height / (sideChairsEach + 1)) * (i + 1)
        });
      }
      
      // Sağ kısım
      for (let i = 0; i < sideChairsEach && chairs.length < capacity; i++) {
        chairs.push({
          x: width + 10,
          y: (height / (sideChairsEach + 1)) * (i + 1)
        });
      }

      // Sandalyeleri çiz
      table.selectAll('.chair')
        .data(chairs)
        .enter()
        .append('circle')
        .attr('class', 'chair')
        .attr('cx', chair => chair.x)
        .attr('cy', chair => chair.y)
        .attr('r', radius)
        .attr('fill', '#475569')
        .attr('stroke', '#fff')
        .attr('stroke-width', 1);
    }

    // Masaları çiz
    const tables = svg.append('g')
      .attr('class', 'tables');

    const tableGroups = tables.selectAll('.table')
      .data(filteredTables)
      .enter()
      .append('g')
      .attr('class', 'table')
      .attr('transform', d => `translate(${d.positionX},${d.positionY})`)
      .call(drag);

    // Masa gölgesi
    tableGroups.append('rect')
      .attr('class', 'table-shadow')
      .attr('width', d => d.width || 60)
      .attr('height', d => d.height || 40)
      .attr('rx', 5)
      .attr('fill', '#000')
      .attr('opacity', 0.1)
      .attr('transform', 'translate(2, 2)');

    // Masa şekli
    const tableRects = tableGroups.append('rect')
      .attr('class', 'table-rect')
      .attr('width', d => d.width || 60)
      .attr('height', d => d.height || 40)
      .attr('rx', 5)
      .attr('fill', d => {
        switch(d.status) {
          case 'EMPTY': return '#22c55e';
          case 'RESERVED': return '#f59e0b';
          case 'OCCUPIED': return '#ef4444';
          default: return '#9ca3af';
        }
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('cursor', 'move');

    // Resize handle (sağ alt köşe)
    tableGroups.append('circle')
      .attr('class', 'resize-handle')
      .attr('cx', d => d.width || 60)
      .attr('cy', d => d.height || 40)
      .attr('r', 4)
      .attr('fill', '#fff')
      .attr('stroke', '#475569')
      .style('cursor', 'se-resize')
      .call(d3.drag()
        .on('drag', function(event, d) {
          const width = Math.max(60, event.x);
          const height = Math.max(40, event.y);
          
          const table = d3.select(this.parentNode);
          
          // Masa şeklini güncelle
          table.select('.table-rect')
            .attr('width', width)
            .attr('height', height);
            
          // Gölgeyi güncelle
          table.select('.table-shadow')
            .attr('width', width)
            .attr('height', height);
          
          // Handle'ı güncelle
          d3.select(this)
            .attr('cx', width)
            .attr('cy', height);
            
          // Masa metnini güncelle
          table.select('text')
            .attr('x', width / 2)
            .attr('y', height / 2);

          // Sandalyeleri güncelle
          updateChairs(table, width, height, d.capacity);
          
          // Geçici olarak d objesini güncelle
          d.width = width;
          d.height = height;
        })
        .on('end', async function(event, d) {
          try {
            const width = Math.max(60, Math.round(event.x));
            const height = Math.max(40, Math.round(event.y));
            
            await fetch('/api/tables/layout', {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                id: d.id,
                width: width,
                height: height
              })
            });

            // State'i güncelle
            setTables(prevTables => 
              prevTables.map(table => 
                table.id === d.id 
                  ? { ...table, width: width, height: height }
                  : table
              )
            );
          } catch (error) {
            console.error('Masa boyutu güncelleme hatası:', error);
            toast.error('Masa boyutu güncellenirken bir hata oluştu');
          }
        })
      );

    // Masa numarası ve ismi
    tableGroups.append('text')
      .text(d => d.name || `Masa ${d.number}`)
      .attr('x', d => (d.width || 60) / 2)
      .attr('y', d => (d.height || 40) / 2)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('fill', 'white')
      .style('font-weight', 'bold')
      .style('font-size', '12px')
      .style('cursor', 'move');

    // İlk sandalye çizimi
    tableGroups.each(function(d) {
      const table = d3.select(this);
      const width = d.width || 60;
      const height = d.height || 40;
      updateChairs(table, width, height, d.capacity);
    });

    tableGroups.on('click', (event, d) => {
      event.stopPropagation();
      setSelectedTable(d);
    });

  }, [filteredTables, loading, selectedSection, sections]);

  const handleAddTable = async (e) => {
    e.preventDefault();
    try {
      // Seçili bölgeyi bul
      const selectedSectionData = sections.find(s => s.id === selectedSection);
      if (!selectedSectionData) {
        throw new Error('Lütfen bir bölge seçin');
      }

      const response = await fetch('/api/tables/layout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newTableData,
          section: selectedSectionData.name, // Bölge adını gönder
          positionX: Math.random() * 600 + 100,
          positionY: Math.random() * 400 + 100
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Masa eklenemedi');
      }

      const newTable = await response.json();
      setTables(prev => [...prev, newTable]);
      setShowAddModal(false);
      setNewTableData({
        name: '',
        number: '',
        capacity: 4,
        status: 'EMPTY'
      });
      toast.success('Yeni masa eklendi');
    } catch (error) {
      console.error('Masa ekleme hatası:', error);
      toast.error(error.message);
    }
  };

  const updateTable = async (tableId, updates) => {
    try {
      console.log('Güncellenecek masa:', tableId);
      console.log('Güncellenecek değerler:', updates);

      const response = await fetch('/api/tables/layout', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: tableId,
          ...updates
        })
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.details || responseData.error || 'Masa güncellenemedi');
      }

      console.log('Sunucudan gelen yanıt:', responseData);

      // State'i güncelle
      setTables(prevTables => 
        prevTables.map(table => 
          table.id === tableId ? { ...table, ...responseData } : table
        )
      );

      // Seçili masa state'ini güncelle
      if (selectedTable?.id === tableId) {
        setSelectedTable(responseData);
      }

      toast.success('Masa güncellendi');
    } catch (error) {
      console.error('Masa güncelleme hatası:', error);
      toast.error(error.message);
    }
  };

  const deleteTable = async (tableId) => {
    try {
      await fetch('/api/tables/layout', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: tableId })
      });
      
      setTables(prev => prev.filter(table => table.id !== tableId));
      setSelectedTable(null);
      toast.success('Masa silindi');
    } catch (error) {
      console.error('Masa silme hatası:', error);
      toast.error('Masa silinirken bir hata oluştu');
    }
  };

  // Debug için useEffect ekleyelim
  useEffect(() => {
    console.log('Güncel state:', {
      selectedSection,
      sections,
      tables,
      filteredTables
    });
  }, [selectedSection, sections, tables, filteredTables]);

  // DataTable kolonları
  const columns = [
    {
      name: 'Masa No',
      selector: row => row.number,
      sortable: true,
    },
    {
      name: 'Masa Adı',
      selector: row => row.name,
      sortable: true,
    },
    {
      name: 'Bölge',
      selector: row => row.section,
      sortable: true,
    },
    {
      name: 'Kapasite',
      selector: row => row.capacity,
      sortable: true,
    },
    {
      name: 'Durum',
      selector: row => row.status,
      sortable: true,
      cell: row => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          row.status === 'EMPTY' ? 'bg-green-100 text-green-800' :
          row.status === 'RESERVED' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {row.status === 'EMPTY' ? 'Boş' :
           row.status === 'RESERVED' ? 'Rezerve' : 'Dolu'}
        </span>
      ),
    },
    {
      name: 'İşlemler',
      cell: row => (
        <div className="flex gap-2">
          <button
            onClick={() => {
              setEditingTable(row);
              setShowEditModal(true);
            }}
            className="p-1 text-blue-600 hover:text-blue-800"
          >
            Düzenle
          </button>
          <button
            onClick={() => handleTableDelete(row.id)}
            className="p-1 text-red-600 hover:text-red-800"
          >
            Sil
          </button>
        </div>
      ),
    },
  ];

  // Üst menüye eklenecek dropdown
  const HeaderDropdown = () => (
    <Menu as="div" className="relative">
      <Menu.Button className="p-2 hover:bg-gray-100 rounded-full">
        <EllipsisVerticalIcon className="h-6 w-6" />
      </Menu.Button>
      <Menu.Items className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
        <Menu.Item>
          {({ active }) => (
            <button
              onClick={() => setShowTableList(true)}
              className={`${
                active ? 'bg-gray-100' : ''
              } w-full text-left px-4 py-2 text-sm`}
            >
              Masa Listesi
            </button>
          )}
        </Menu.Item>
        <Menu.Item>
          {({ active }) => (
            <button
              onClick={() => setShowSectionList(true)}
              className={`${
                active ? 'bg-gray-100' : ''
              } w-full text-left px-4 py-2 text-sm`}
            >
              Bölge Yönetimi
            </button>
          )}
        </Menu.Item>
      </Menu.Items>
    </Menu>
  );

  // Masa düzenleme modalı
  const EditTableModal = ({ table, onClose }) => {
    const [formData, setFormData] = useState(table);

    const handleSubmit = async (e) => {
      e.preventDefault();
      await updateTable(table.id, formData);
      onClose();
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-[500px]">
          <h2 className="text-xl font-semibold mb-4">Masa Düzenle</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Masa İsmi</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full rounded border p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Masa Numarası</label>
              <input
                type="number"
                value={formData.number}
                onChange={(e) => setFormData(prev => ({ ...prev, number: parseInt(e.target.value) }))}
                className="w-full rounded border p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Kapasite</label>
              <input
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData(prev => ({ ...prev, capacity: parseInt(e.target.value) }))}
                className="w-full rounded border p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Bölge</label>
              <select
                value={sections.find(s => s.name === formData.section)?.id}
                onChange={(e) => {
                  const section = sections.find(s => s.id === parseInt(e.target.value));
                  if (section) {
                    setFormData(prev => ({ ...prev, section: section.name }));
                  }
                }}
                className="w-full rounded border p-2"
              >
                {sections.map(section => (
                  <option key={section.id} value={section.id}>
                    {section.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Durum</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                className="w-full rounded border p-2"
              >
                <option value="EMPTY">Boş</option>
                <option value="RESERVED">Rezerve</option>
                <option value="OCCUPIED">Dolu</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border rounded"
              >
                İptal
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Kaydet
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Bölge yönetimi modalı
  const SectionManagementModal = ({ onClose }) => {
    const [formData, setFormData] = useState(newSection);
    const [editingSection, setEditingSection] = useState(null);

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        if (editingSection) {
          // Güncelleme işlemi
          const response = await fetch(`/api/sections/${editingSection.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
          });

          if (!response.ok) throw new Error('Bölge güncellenemedi');
          toast.success('Bölge güncellendi');
        } else {
          // Yeni bölge ekleme
          const response = await fetch('/api/sections', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
          });

          if (!response.ok) throw new Error('Bölge eklenemedi');
          toast.success('Bölge eklendi');
        }

        fetchSections();
        setFormData({ name: '', colorCode: '#3B82F6' });
        setEditingSection(null);
      } catch (error) {
        toast.error(error.message);
      }
    };

    const handleEdit = (section) => {
      setEditingSection(section);
      setFormData({
        name: section.name,
        colorCode: section.colorCode
      });
    };

    const handleCancel = () => {
      setEditingSection(null);
      setFormData({ name: '', colorCode: '#3B82F6' });
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-[800px]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Bölge Yönetimi</h2>
            <button onClick={onClose} className="text-gray-500">✕</button>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Bölge Listesi */}
            <div>
              <h3 className="font-medium mb-2">Mevcut Bölgeler</h3>
              <div className="space-y-2">
                {sections.map(section => (
                  <div key={section.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: section.colorCode }}
                      />
                      <span>{section.name}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(section)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Düzenle
                      </button>
                      <button
                        onClick={() => handleSectionDelete(section.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Sil
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bölge Formu */}
            <div>
              <h3 className="font-medium mb-2">
                {editingSection ? 'Bölge Düzenle' : 'Yeni Bölge Ekle'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Bölge Adı</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full rounded border p-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Renk</label>
                  <input
                    type="color"
                    value={formData.colorCode}
                    onChange={(e) => setFormData(prev => ({ ...prev, colorCode: e.target.value }))}
                    className="w-full h-10 rounded border p-1"
                  />
                </div>
                <div className="flex gap-2">
                  {editingSection && (
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="flex-1 px-4 py-2 border rounded hover:bg-gray-50"
                    >
                      İptal
                    </button>
                  )}
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    {editingSection ? 'Güncelle' : 'Bölge Ekle'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="flex items-center justify-center h-96">
            <div className="text-lg">Yükleniyor...</div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 max-w-[1600px] mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Masa Düzeni Yönetimi</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition-colors"
            >
              Yeni Masa Ekle
            </button>
            <HeaderDropdown />
          </div>
        </div>

        <div className="mb-4 flex gap-4 items-center">
          {/* Bölge Seçimi */}
          <div className="flex gap-2">
            {sections && sections.length > 0 ? (
              sections.map(section => (
                <button
                  key={section.id}
                  onClick={() => setSelectedSection(section.id)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selectedSection === section.id
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {section.name}
                </button>
              ))
            ) : (
              <div>Bölge bulunamadı</div>
            )}
          </div>

          {/* Durum Filtreleri */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border rounded p-2 focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="all">Tüm Masalar</option>
            <option value="empty">Boş Masalar</option>
            <option value="reserved">Rezerve Masalar</option>
            <option value="occupied">Dolu Masalar</option>
          </select>

          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-[#22c55e]"></div>
              <span>Boş</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-[#f59e0b]"></div>
              <span>Rezerve</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-[#ef4444]"></div>
              <span>Dolu</span>
            </div>
          </div>
        </div>

        <div className="flex gap-6">
          <div className="flex-1 border rounded-lg p-4 bg-white shadow-sm">
            <svg ref={svgRef} className="w-full h-[700px]"></svg>
          </div>

          {selectedTable && (
            <div className="w-96 border rounded-lg p-4 bg-white shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Masa Detayları</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium">Masa İsmi</label>
                  <input
                    type="text"
                    value={selectedTable.name || ''}
                    onChange={(e) => {
                      const newName = e.target.value;
                      setSelectedTable(prev => ({ ...prev, name: newName }));
                      updateTable(selectedTable.id, { name: newName });
                    }}
                    placeholder={`Masa ${selectedTable.number}`}
                    className="mt-1 block w-full rounded border p-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Masa Numarası</label>
                  <input
                    type="number"
                    value={selectedTable.number}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (!isNaN(value) && value > 0) {
                        setSelectedTable(prev => ({ ...prev, number: value }));
                        updateTable(selectedTable.id, { number: value });
                      }
                    }}
                    min="1"
                    className="mt-1 block w-full rounded border p-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Kapasite</label>
                  <input
                    type="number"
                    value={selectedTable.capacity}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (!isNaN(value) && value > 0) {
                        setSelectedTable(prev => ({ ...prev, capacity: value }));
                        updateTable(selectedTable.id, { capacity: value });
                      }
                    }}
                    min="1"
                    max="12"
                    className="mt-1 block w-full rounded border p-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Bölge</label>
                  <select
                    value={sections.find(s => s.name === selectedTable.section)?.id}
                    onChange={(e) => {
                      const section = sections.find(s => s.id === parseInt(e.target.value));
                      if (section) {
                        setSelectedTable(prev => ({ ...prev, section: section.name }));
                        updateTable(selectedTable.id, { section: section.name });
                      }
                    }}
                    className="mt-1 block w-full rounded border p-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    {sections.map(section => (
                      <option key={section.id} value={section.id}>
                        {section.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium">Durum</label>
                  <select
                    value={selectedTable.status}
                    onChange={(e) => {
                      const newStatus = e.target.value;
                      setSelectedTable(prev => ({ ...prev, status: newStatus }));
                      updateTable(selectedTable.id, { status: newStatus });
                    }}
                    className="mt-1 block w-full rounded border p-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="EMPTY">Boş</option>
                    <option value="RESERVED">Rezerve</option>
                    <option value="OCCUPIED">Dolu</option>
                  </select>
                </div>
                <div className="flex gap-2 pt-4">
                  <button
                    onClick={() => deleteTable(selectedTable.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                  >
                    Masayı Sil
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Yeni Masa Ekleme Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-[500px]">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  {sections.find(s => s.id === selectedSection)?.name || 'Yeni'} Masa Ekle
                </h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={handleAddTable} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Masa İsmi</label>
                  <input
                    type="text"
                    value={newTableData.name}
                    onChange={(e) => setNewTableData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder={`${sections.find(s => s.id === selectedSection)?.name} Masası`}
                    className="w-full rounded border p-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Masa Numarası</label>
                  <input
                    type="number"
                    value={newTableData.number}
                    onChange={(e) => setNewTableData(prev => ({ ...prev, number: parseInt(e.target.value) }))}
                    min="1"
                    required
                    className="w-full rounded border p-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Kapasite</label>
                  <input
                    type="number"
                    value={newTableData.capacity}
                    onChange={(e) => setNewTableData(prev => ({ ...prev, capacity: parseInt(e.target.value) }))}
                    min="1"
                    max="12"
                    required
                    className="w-full rounded border p-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                
                <div className="flex gap-2 justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border rounded hover:bg-gray-50"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
                  >
                    Masa Ekle
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Masa Listesi Modal */}
        {showTableList && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-[1000px]">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Masa Listesi</h2>
                <button onClick={() => setShowTableList(false)} className="text-gray-500">✕</button>
              </div>
              <DataTable
                columns={columns}
                data={tables}
                pagination
                highlightOnHover
                pointerOnHover
              />
            </div>
          </div>
        )}

        {/* Bölge Yönetimi Modal */}
        {showSectionList && (
          <SectionManagementModal onClose={() => setShowSectionList(false)} />
        )}

        {/* Masa Düzenleme Modal */}
        {showEditModal && editingTable && (
          <EditTableModal
            table={editingTable}
            onClose={() => {
              setShowEditModal(false);
              setEditingTable(null);
            }}
          />
        )}
      </div>
    </AdminLayout>
  );
};

export default TableLayout; 