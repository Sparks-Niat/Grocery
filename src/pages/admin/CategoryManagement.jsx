import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, X, Upload, Loader2, Image as ImageIcon, AlertCircle } from 'lucide-react';
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
    iconName: 'Package',
    publicId: ''
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

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
    setUploadError('');
    if (category) {
      setEditingCategory(category);
      setFormData({
        id: category.id,
        name: category.name || '',
        description: category.description || '',
        image: category.image || '',
        iconName: category.iconName || 'Package',
        publicId: category.publicId || ''
      });
      setImagePreview(category.image || '');
    } else {
      setEditingCategory(null);
      setFormData({
        id: 'cat-' + Date.now(),
        name: '',
        description: '',
        image: '',
        iconName: 'Package',
        publicId: ''
      });
      setImagePreview('');
    }
    setImageFile(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setImageFile(null);
    setImagePreview('');
    setUploadError('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadError('');

    // Client-side file validation
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Invalid file format. Please choose a JPEG, PNG, WEBP, GIF, or AVIF image.');
      e.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size exceeds the 5MB limit. Please choose a smaller image.');
      e.target.value = '';
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview('');
    setFormData(prev => ({ ...prev, image: '', publicId: '' }));
  };

  const handleImageUpload = async () => {
    if (!imageFile) return { url: formData.image, publicId: formData.publicId };
    
    const formDataObj = new FormData();
    formDataObj.append('image', imageFile);
    formDataObj.append('folder', 'categories');
    
    const token = localStorage.getItem('adminToken');
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formDataObj
    });
    
    const data = await res.json();
    if (res.ok && data.url) {
      return { url: data.url, publicId: data.publicId };
    }
    throw new Error(data.error || 'Cloudinary upload failed.');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setUploadError('');
    
    try {
      let imageUrl = formData.image;
      let publicId = formData.publicId;

      if (imageFile) {
        const uploadRes = await handleImageUpload();
        imageUrl = uploadRes.url;
        publicId = uploadRes.publicId;
      }

      const payload = { ...formData, image: imageUrl, publicId };
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
        const errData = await res.json();
        setUploadError(errData.error || 'Failed to save category.');
      }
    } catch (err) {
      console.error(err);
      setUploadError(err.message || 'An error occurred during submission.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category? Associated Cloudinary images will also be removed.")) return;
    
    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchData();
      } else {
        alert('Failed to delete category');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Category Management</h2>
          <p className="text-sm text-gray-500">Manage categories, banners, and icons with Cloudinary storage</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          <Plus className="w-5 h-5 mr-1" />
          Add Category
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase">
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Storage</th>
                <th className="px-6 py-4">Icon</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="5" className="text-center py-8 text-gray-500">Loading categories...</td></tr>
              ) : filteredCategories.map(category => {
                const IconComponent = Icons[category.iconName] || Icons.Package;
                const isCloudinary = category.image && category.image.includes('cloudinary.com');
                return (
                  <tr key={category.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 flex items-center">
                      <img 
                        src={category.image} 
                        alt={category.name}
                        className="w-12 h-12 rounded object-cover border border-gray-200 mr-4"
                        onError={(e) => e.target.src = '/placeholder.png'}
                      />
                      <div>
                        <span className="font-medium text-gray-800 block">{category.name}</span>
                        <span className="text-xs text-gray-400">{category.id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                      {category.description}
                    </td>
                    <td className="px-6 py-4 text-xs">
                      {isCloudinary ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full font-medium bg-blue-50 text-blue-700 border border-blue-200">
                          Cloudinary
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-600">
                          Local Asset
                        </span>
                      )}
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
                        title="Edit category"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(category.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Delete category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {!loading && filteredCategories.length === 0 && (
                <tr><td colSpan="5" className="text-center py-8 text-gray-500">No categories found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-800">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            {uploadError && (
              <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{uploadError}</span>
              </div>
            )}
            
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
              
              {/* Cloudinary Banner Image Upload Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Banner Image (Cloudinary Managed)</label>
                
                {imagePreview ? (
                  <div className="relative mb-3 p-2 border border-gray-200 rounded-lg bg-gray-50 flex items-center gap-3">
                    <img 
                      src={imagePreview} 
                      alt="Banner Preview" 
                      className="w-20 h-16 object-cover rounded border border-gray-300"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-700 truncate">
                        {imageFile ? imageFile.name : (formData.image || 'Current Image')}
                      </p>
                      <p className="text-[11px] text-gray-500">
                        {imageFile ? `${(imageFile.size / 1024).toFixed(1)} KB (Ready to upload)` : (
                          formData.image?.includes('cloudinary.com') ? 'Stored securely on Cloudinary' : 'Local static asset'
                        )}
                      </p>
                    </div>
                    <button 
                      type="button" 
                      onClick={clearImage}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                      title="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="mb-2 p-4 border-2 border-dashed border-gray-200 rounded-lg text-center bg-gray-50/50">
                    <ImageIcon className="w-8 h-8 mx-auto text-gray-300 mb-1" />
                    <p className="text-xs text-gray-500">No image selected. Upload a banner image below.</p>
                  </div>
                )}

                <input 
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                  onChange={handleFileChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 cursor-pointer"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Supported formats: JPEG, PNG, WEBP, GIF, AVIF (Max 5MB). Images are optimized automatically by Cloudinary.
                </p>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3 mt-6">
                <button 
                  type="button" 
                  onClick={closeModal}
                  disabled={uploading}
                  className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={uploading}
                  className="px-5 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg transition flex items-center gap-2 disabled:opacity-50"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{imageFile ? 'Uploading to Cloudinary...' : 'Saving...'}</span>
                    </>
                  ) : (
                    <span>Save Category</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
