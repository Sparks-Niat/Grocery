import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Save } from 'lucide-react';
import { getApiUrl } from '../../utils/api';

export default function HeroEditor() {
  const [items, setItems] = useState([]);
  const [settings, setSettings] = useState({ heroHeading: '', heroSubtitle: '' });
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ id: '', label: '', displayOrder: 1, isActive: true });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tagsRes, settingsRes] = await Promise.all([
        fetch(getApiUrl('/api/hero_value_tags')),
        fetch(getApiUrl('/api/settings'))
      ]);
      if (tagsRes.ok) setItems(await tagsRes.json());
      if (settingsRes.ok) {
        const s = await settingsRes.json();
        setSettings({ heroHeading: s.heroHeading || '', heroSubtitle: s.heroSubtitle || '' });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    const token = localStorage.getItem('adminToken');
    try {
      await fetch(getApiUrl('/api/settings'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(settings)
      });
      alert('Settings saved!');
    } catch (err) {
      console.error(err);
    } finally {
      setSavingSettings(false);
    }
  };

  const openModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData(item);
    } else {
      setEditingItem(null);
      setFormData({ id: 'tag-' + Date.now(), label: '', displayOrder: items.length + 1, isActive: true });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = editingItem ? 'PUT' : 'POST';
      const endpoint = editingItem ? `/api/hero_value_tags/${editingItem.id}` : '/api/hero_value_tags';
      const token = localStorage.getItem('adminToken');

      const res = await fetch(getApiUrl(endpoint), {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        closeModal();
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this tag?")) return;
    const token = localStorage.getItem('adminToken');
    await fetch(getApiUrl(`/api/hero_value_tags/${id}`), {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchData();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Hero Section Editor</h2>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Hero Text</h3>
        <form onSubmit={saveSettings} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Heading</label>
            <input type="text" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none" value={settings.heroHeading} onChange={e => setSettings({...settings, heroHeading: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
            <input type="text" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none" value={settings.heroSubtitle} onChange={e => setSettings({...settings, heroSubtitle: e.target.value})} />
          </div>
          <div className="flex justify-end pt-2">
            <button type="submit" disabled={savingSettings} className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              <Save className="w-4 h-4 mr-2" /> {savingSettings ? 'Saving...' : 'Save Text'}
            </button>
          </div>
        </form>
      </div>

      <div className="flex justify-between items-center mt-8">
        <h3 className="text-lg font-semibold text-gray-800">Value Proposition Tags</h3>
        <button onClick={() => openModal()} className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
          <Plus className="w-4 h-4 mr-2" /> Add Tag
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
              <th className="px-6 py-3 font-medium">Label</th>
              <th className="px-6 py-3 font-medium">Order</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan="4" className="text-center py-8">Loading...</td></tr>
            ) : items.map(item => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-800">{item.label}</td>
                <td className="px-6 py-4 text-gray-600">{item.displayOrder}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${item.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {item.isActive ? 'Active' : 'Hidden'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => openModal(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg mr-2"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(item.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold">{editingItem ? 'Edit Tag' : 'Add Tag'}</h3>
              <button onClick={closeModal}><X className="w-6 h-6 text-gray-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tag Label</label>
                <input type="text" required className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none" value={formData.label} onChange={e => setFormData({...formData, label: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                <input type="number" required className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none" value={formData.displayOrder} onChange={e => setFormData({...formData, displayOrder: parseInt(e.target.value)})} />
              </div>
              <div className="flex items-center">
                <input type="checkbox" id="isActive" className="w-4 h-4 text-green-600 rounded border-gray-300" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} />
                <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">Active (Visible)</label>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
