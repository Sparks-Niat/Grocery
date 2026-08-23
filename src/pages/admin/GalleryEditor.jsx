import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Upload } from 'lucide-react';

export default function GalleryEditor() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ id: '', title: '', description: '', image: '', displayOrder: 1, isActive: true });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/gallery_items');
      if (res.ok) setItems(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append('image', file);

    setUploading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: data
      });
      const result = await res.json();
      if (result.url) {
        setFormData({ ...formData, image: `http://localhost:5000${result.url}` });
      }
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const openModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData(item);
    } else {
      setEditingItem(null);
      setFormData({ id: 'gal-' + Date.now(), title: '', description: '', image: '', displayOrder: items.length + 1, isActive: true });
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
      const url = editingItem ? `/api/gallery_items/${editingItem.id}` : '/api/gallery_items';
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

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this gallery image?")) return;
    const token = localStorage.getItem('adminToken');
    await fetch(`/api/gallery_items/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchData();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Gallery Editor</h2>
        <button onClick={() => openModal()} className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
          <Plus className="w-5 h-5 mr-2" /> Add Image
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
              <th className="px-6 py-3 font-medium">Image</th>
              <th className="px-6 py-3 font-medium">Title</th>
              <th className="px-6 py-3 font-medium">Description</th>
              <th className="px-6 py-3 font-medium">Order</th>
              <th className="px-6 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan="5" className="text-center py-8">Loading...</td></tr>
            ) : items.map(item => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  {item.image ? (
                    <img src={item.image} alt={item.title} className="w-16 h-16 object-cover rounded-lg" />
                  ) : (
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">No Img</div>
                  )}
                </td>
                <td className="px-6 py-4 font-medium text-gray-800">{item.title}</td>
                <td className="px-6 py-4 text-gray-600 truncate max-w-xs">{item.description}</td>
                <td className="px-6 py-4 text-gray-600">{item.displayOrder}</td>
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
              <h3 className="text-xl font-bold">{editingItem ? 'Edit Gallery Image' : 'Add Gallery Image'}</h3>
              <button onClick={closeModal}><X className="w-6 h-6 text-gray-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image Upload</label>
                <div className="flex items-center gap-4">
                  {formData.image && (
                    <img src={formData.image} alt="Preview" className="w-16 h-16 object-cover rounded-lg border" />
                  )}
                  <label className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200">
                    <Upload className="w-4 h-4 mr-2" />
                    {uploading ? 'Uploading...' : 'Choose File'}
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input type="text" required className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                <input type="text" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
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
