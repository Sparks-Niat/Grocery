import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Save } from 'lucide-react';

export default function FooterEditor() {
  const [links, setLinks] = useState([]);
  const [socials, setSocials] = useState([]);
  const [settings, setSettings] = useState({ footerAbout: '', copyright: '' });
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('link'); // 'link' or 'social'
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [linksRes, socialsRes, settingsRes] = await Promise.all([
        fetch('/api/footer_links'),
        fetch('/api/social_links'),
        fetch('/api/settings')
      ]);
      if (linksRes.ok) setLinks(await linksRes.json());
      if (socialsRes.ok) setSocials(await socialsRes.json());
      if (settingsRes.ok) {
        const s = await settingsRes.json();
        setSettings({ footerAbout: s.footerAbout || '', copyright: s.copyright || '' });
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
      await fetch('/api/settings', {
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

  const openModal = (type, item = null) => {
    setModalType(type);
    if (item) {
      setEditingItem(item);
      setFormData(item);
    } else {
      setEditingItem(null);
      if (type === 'link') {
        setFormData({ id: 'link-' + Date.now(), label: '', path: '', displayOrder: links.length + 1, isActive: true });
      } else {
        setFormData({ id: 'soc-' + Date.now(), platform: '', url: '', iconName: 'Facebook', displayOrder: socials.length + 1, isActive: true });
      }
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
      const endpoint = modalType === 'link' ? 'footer_links' : 'social_links';
      const method = editingItem ? 'PUT' : 'POST';
      const url = editingItem ? `/api/${endpoint}/${editingItem.id}` : `/api/${endpoint}`;
      const token = localStorage.getItem('adminToken');

      const res = await fetch(url, {
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

  const handleDelete = async (type, id) => {
    if (!window.confirm("Delete this item?")) return;
    const endpoint = type === 'link' ? 'footer_links' : 'social_links';
    const token = localStorage.getItem('adminToken');
    await fetch(`/api/${endpoint}/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchData();
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-800">Footer Editor</h2>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Footer Settings</h3>
        <form onSubmit={saveSettings} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">About Text (Brand Description)</label>
            <textarea className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none" rows="3" value={settings.footerAbout} onChange={e => setSettings({...settings, footerAbout: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Copyright Text</label>
            <input type="text" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none" value={settings.copyright} onChange={e => setSettings({...settings, copyright: e.target.value})} />
          </div>
          <div className="flex justify-end pt-2">
            <button type="submit" disabled={savingSettings} className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              <Save className="w-4 h-4 mr-2" /> {savingSettings ? 'Saving...' : 'Save Text'}
            </button>
          </div>
        </form>
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Quick Links</h3>
          <button onClick={() => openModal('link')} className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" /> Add Link
          </button>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
                <th className="px-6 py-3 font-medium">Label</th>
                <th className="px-6 py-3 font-medium">Path</th>
                <th className="px-6 py-3 font-medium">Order</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? <tr><td colSpan="4" className="text-center py-4">Loading...</td></tr> : links.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{item.label}</td>
                  <td className="px-6 py-4">{item.path}</td>
                  <td className="px-6 py-4">{item.displayOrder}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => openModal('link', item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg mr-2"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete('link', item.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Social Media Links</h3>
          <button onClick={() => openModal('social')} className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" /> Add Social
          </button>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
                <th className="px-6 py-3 font-medium">Platform</th>
                <th className="px-6 py-3 font-medium">URL</th>
                <th className="px-6 py-3 font-medium">Icon (Lucide)</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? <tr><td colSpan="4" className="text-center py-4">Loading...</td></tr> : socials.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{item.platform}</td>
                  <td className="px-6 py-4">{item.url}</td>
                  <td className="px-6 py-4">{item.iconName}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => openModal('social', item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg mr-2"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete('social', item.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold">{editingItem ? 'Edit' : 'Add'} {modalType === 'link' ? 'Link' : 'Social'}</h3>
              <button onClick={closeModal}><X className="w-6 h-6 text-gray-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {modalType === 'link' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
                    <input type="text" required className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none" value={formData.label} onChange={e => setFormData({...formData, label: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Path</label>
                    <input type="text" required className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none" value={formData.path} onChange={e => setFormData({...formData, path: e.target.value})} />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Platform Name</label>
                    <input type="text" required className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none" value={formData.platform} onChange={e => setFormData({...formData, platform: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                    <input type="text" required className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none" value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Icon Name (Lucide React)</label>
                    <input type="text" required className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none" placeholder="e.g. Facebook, Instagram" value={formData.iconName} onChange={e => setFormData({...formData, iconName: e.target.value})} />
                  </div>
                </>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                <input type="number" required className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none" value={formData.displayOrder} onChange={e => setFormData({...formData, displayOrder: parseInt(e.target.value)})} />
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
