'use client';
import { useState, useEffect } from 'react';

export default function AdditionGroupSelector({ menuItemId, onUpdate }) {
    const [groups, setGroups] = useState([]);
    const [selectedGroups, setSelectedGroups] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchGroups();
        if (menuItemId) {
            fetchMenuItemGroups();
        }
    }, [menuItemId]);

    const fetchGroups = async () => {
        try {
            const response = await fetch('/api/menu-additions/groups');
            if (!response.ok) throw new Error('Malzeme grupları alınamadı');
            const data = await response.json();
            setGroups(data);
        } catch (error) {
            console.error('Grup listesi hatası:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMenuItemGroups = async () => {
        try {
            const response = await fetch(`/api/menu/${menuItemId}/additions`);
            if (!response.ok) throw new Error('Menü malzeme grupları alınamadı');
            const data = await response.json();
            setSelectedGroups(data);
        } catch (error) {
            console.error('Menü grupları hatası:', error);
        }
    };

    const handleGroupSelect = async (groupId) => {
        try {
            const response = await fetch(`/api/menu/${menuItemId}/additions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    groupId,
                    isRequired: false,
                    minSelect: 0,
                    maxSelect: 1
                })
            });

            if (!response.ok) throw new Error('Grup eklenemedi');
            
            await fetchMenuItemGroups();
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('Grup ekleme hatası:', error);
            alert(error.message);
        }
    };

    if (loading) return <div>Yükleniyor...</div>;

    return (
        <div className="space-y-4">
            <h3 className="font-medium">Ekstra Malzeme Grupları</h3>
            <div className="grid grid-cols-1 gap-4">
                {groups.map(group => (
                    <div key={group.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium">{group.name}</h4>
                                <p className="text-sm text-gray-500">{group.description}</p>
                            </div>
                            <button
                                onClick={() => handleGroupSelect(group.id)}
                                className="px-3 py-1 bg-orange-500 text-white rounded-lg text-sm"
                            >
                                Ekle
                            </button>
                        </div>
                        {group.additions?.length > 0 && (
                            <div className="mt-2 pl-4 border-l-2 border-gray-200">
                                <p className="text-sm text-gray-600">Malzemeler:</p>
                                <ul className="mt-1 space-y-1">
                                    {group.additions.map(addition => (
                                        <li key={addition.id} className="text-sm">
                                            {addition.name} - ₺{addition.price}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
} 