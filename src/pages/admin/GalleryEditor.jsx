import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Upload, Loader2, Image as ImageIcon, AlertCircle } from 'lucide-react';

export default function GalleryEditor() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ 
    id: '', 
    title: '', 
    description: '', 
    image: '', 
    displayOrder: 1, 
    isActive: true,
    publicId: ''
  });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

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

    const data = new FormData();
    data.append('image', file);
    data.append('folder', 'gallery');

    setUploading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: data
      });
      const result = await res.json();
      if (res.ok && result.url) {
        setFormData(prev => ({ 
          ...prev, 
          image: result.url,
          publicId: result.publicId || ''
        }));
      } else {
        setUploadError(result.error || 'Image upload to Cloudinary failed.');
      }
    } catch (err) {
      console.error('Upload failed:', err);
      setUploadError(err.message || 'Image upload failed.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const clearImage = () => {
    setFormData(prev => ({ ...prev, image: '', publicId: '' }));
  };

  const openModal = (item = null) => {
    setUploadError('');
    if (item) {
      setEditingItem(item);
      setFormData({
        id: item.id,
        title: item.title || '',
        description: item.description || '',
        image: item.image || '',
        displayOrder: item.displayOrder || 1,
        isActive: item.isActive !== undefined ? item.isActive : true,
        publicId: item.publicId || ''
      });
    } else {
      setEditingItem(null);
      setFormData({ 
        id: 'gal-' + Date.now(), 
        title: '', 
        description: '', 
        image: '', 
        displayOrder: items.length + 1, 
        isActive: true,
        publicId: ''
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setUploadError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.image) {
      setUploadError('Please upload an image for this gallery item.');
      return;
    }

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
      } else {
        const errData = await res.json();
        setUploadError(errData.error || 'Failed to save gallery item.');
      }
    } catch (err) {
      console.error(err);
      setUploadError(err.message || 'Error saving gallery item.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this gallery image? The Cloudinary asset will also be removed.")) return;
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
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Gallery Editor</h2>
          <p className="text-sm text-gray-500">Manage showroom photos with automatic Cloudinary CDN delivery</p>
        </div>
        <button onClick={() => openModal()} className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
          <Plus className="w-5 h-5 mr-2" /> Add Image
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
              <th className="px-6 py-3 font-medium">Image</th>
              <th className="px-6 py-3 font-medium">Title</th>
              <th className="px-6 py-3 font-medium">Storage</th>
              <th className="px-6 py-3 font-medium">Description</th>
              <th className="px-6 py-3 font-medium">Order</th>
              <th className="px-6 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan="6" className="text-center py-8 text-gray-500">Loading gallery...</td></tr>
            ) : items.map(item => {
              const isCloudinary = item.image && item.image.includes('cloudinary.com');
              return (
                <tr key={item.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    {item.image ? (
                      <img src={item.image} alt={item.title} className="w-16 h-12 object-cover rounded-lg border border-gray-200" />
                    ) : (
                      <div className="w-16 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs">No Img</div>
                    )}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-800">{item.title}</td>
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
                  <td className="px-6 py-4 text-gray-600 truncate max-w-xs">{item.description}</td>
                  <td className="px-6 py-4 text-gray-600">{item.displayOrder}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => openModal(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg mr-2" title="Edit image">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Delete image">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
            {!loading && items.length === 0 && (
              <tr><td colSpan="6" className="text-center py-8 text-gray-500">No gallery items found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-800">{editingItem ? 'Edit Gallery Image' : 'Add Gallery Image'}</h3>
              <button onClick={closeModal}><X className="w-6 h-6 text-gray-400 hover:text-gray-600" /></button>
            </div>

            {uploadError && (
              <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{uploadError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image (Cloudinary Managed)</label>
                
                {formData.image ? (
                  <div className="relative mb-3 p-2 border border-gray-200 rounded-lg bg-gray-50 flex items-center gap-3">
                    <img src={formData.image} alt="Preview" className="w-16 h-16 object-cover rounded-lg border border-gray-300" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-700 truncate">Image uploaded</p>
                      <p className="text-[11px] text-gray-500">
                        {formData.image.includes('cloudinary.com') ? 'Stored on Cloudinary' : 'Local static asset'}
                      </p>
                    </div>
                    <button 
                      type="button" 
                      onClick={clearImage} 
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                      title="Clear image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="mb-2 p-4 border-2 border-dashed border-gray-200 rounded-lg text-center bg-gray-50/50">
                    <ImageIcon className="w-8 h-8 mx-auto text-gray-300 mb-1" />
                    <p className="text-xs text-gray-500">No image uploaded yet.</p>
                  </div>
                )}

                <label className={`flex items-center justify-center px-4 py-2.5 border border-gray-300 rounded-lg cursor-pointer bg-white hover:bg-gray-50 transition text-sm font-medium text-gray-700 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin text-green-600" />
                      <span>Uploading to Cloudinary...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2 text-green-600" />
                      <span>{formData.image ? 'Replace Image via Cloudinary' : 'Upload Image to Cloudinary'}</span>
                    </>
                  )}
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/jpeg,image/png,image/webp,image/gif,image/avif" 
                    onChange={handleImageUpload} 
                    disabled={uploading} 
                  />
                </label>
                <p className="text-[11px] text-gray-400 mt-1">
                  Supported: JPEG, PNG, WEBP, GIF, AVIF (Max 5MB).
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input 
                  type="text" 
                  required 
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})} 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                <input 
                  type="text" 
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                <input 
                  type="number" 
                  required 
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" 
                  value={formData.displayOrder} 
                  onChange={e => setFormData({...formData, displayOrder: parseInt(e.target.value) || 1})} 
                />
              </div>

              <div className="flex items-center pt-1">
                <input 
                  type="checkbox" 
                  id="isActive" 
                  className="w-4 h-4 text-green-600 rounded border-gray-300 cursor-pointer" 
                  checked={formData.isActive} 
                  onChange={e => setFormData({...formData, isActive: e.target.checked})} 
                />
                <label htmlFor="isActive" className="ml-2 text-sm text-gray-700 cursor-pointer">Active (Visible on Website)</label>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                <button type="button" onClick={closeModal} disabled={uploading} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition disabled:opacity-50">
                  Cancel
                </button>
                <button type="submit" disabled={uploading} className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition disabled:opacity-50 flex items-center gap-2">
                  <span>Save Image</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
