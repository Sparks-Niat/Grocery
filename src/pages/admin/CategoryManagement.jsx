import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, X } from 'lucide-react';
import * as Icons from 'lucide-react';

export default function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    description: '',
    image: '',
    iconName: 'Package'
  });

  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) setCategories(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData(category);
    } else {
      setEditingCategory(null);
      setFormData({
        id: 'cat-' + Date.now(),
        name: '',
        description: '',
        image: '',
        iconName: 'Package'
      });
    }
    setImageFile(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const handleImageUpload = async () => {
    if (!imageFile) return formData.image;
    
    const formDataObj = new FormData();
    formDataObj.append('image', imageFile);
    
    const token = localStorage.getItem('adminToken');
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formDataObj
    });
    
    if (res.ok) {
      const data = await res.json();
      return data.url;
    }
    throw new Error("Image upload failed");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    
    try {
      let imageUrl = formData.image;
      if (imageFile) {
        imageUrl = await handleImageUpload();
      }

      const payload = { ...formData, image: imageUrl };
      const method = editingCategory ? 'PUT' : 'POST';
      const url = editingCategory ? `/api/categories/${editingCategory.id}` : '/api/categories';
      const token = localStorage.getItem('adminToken');

      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        closeModal();
        fetchData();
      } else {
        alert("Failed to save category");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving category");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category? Products linked to it may be affected.")) return;
    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Category Management</h2>
        <button 
          onClick={() => openModal()}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Category
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-md">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text"
              placeholder="Search categories..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
                <th className="px-6 py-3 font-medium">Category</th>
                <th className="px-6 py-3 font-medium">Description</th>
                <th className="px-6 py-3 font-medium">Icon</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="4" className="text-center py-8">Loading...</td></tr>
              ) : filteredCategories.map(category => {
                const IconComponent = Icons[category.iconName] || Icons.Package;
                return (
                  <tr key={category.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 flex items-center">
                      <img 
                        src={category.image} 
                        alt={category.name}
                        className="w-12 h-12 rounded object-cover border border-gray-200 mr-4"
                        onError={(e) => e.target.src = '/placeholder.png'}
                      />
                      <span className="font-medium text-gray-800">{category.name}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                      {category.description}
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-8 h-8 bg-green-50 rounded flex items-center justify-center text-green-600">
                        <IconComponent className="w-5 h-5" />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => openModal(category)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg mr-2"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(category.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {!loading && filteredCategories.length === 0 && (
                <tr><td colSpan="4" className="text-center py-8 text-gray-500">No categories found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-800">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category ID (URL slug)</label>
                <input 
                  type="text" 
                  required
                  readOnly={!!editingCategory}
                  className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none"
                  value={formData.id}
                  onChange={e => setFormData({...formData, id: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input 
                  type="text" 
                  required
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lucide Icon Name (e.g. Package, Apple)</label>
                <input 
                  type="text" 
                  required
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                  value={formData.iconName}
                  onChange={e => setFormData({...formData, iconName: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Banner Image Upload</label>
                <input 
                  type="file"
                  accept="image/*"
                  onChange={e => setImageFile(e.target.files[0])}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                />
                {formData.image && !imageFile && (
                  <p className="text-xs text-gray-500 mt-1">Current image: {formData.image}</p>
                )}
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3 mt-6">
                <button 
                  type="button" 
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={uploading}
                  className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg transition disabled:opacity-50"
                >
                  {uploading ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
