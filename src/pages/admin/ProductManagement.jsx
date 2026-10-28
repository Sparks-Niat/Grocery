import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, X, Loader2, Image as ImageIcon, AlertCircle } from 'lucide-react';

export default function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    categoryId: '',
    price: '',
    packSize: '',
    inStock: true,
    featured: false,
    image: '',
    description: '',
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
      const [prodRes, catRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories')
      ]);
      if (prodRes.ok) setProducts(await prodRes.json());
      if (catRes.ok) setCategories(await catRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (product = null) => {
    setUploadError('');
    if (product) {
      setEditingProduct(product);
      setFormData({
        id: product.id,
        name: product.name || '',
        categoryId: product.categoryId || (categories[0]?.id || ''),
        price: product.price || '',
        packSize: product.packSize || '',
        inStock: Boolean(product.inStock),
        featured: Boolean(product.featured),
        image: product.image || '',
        description: product.description || '',
        publicId: product.publicId || ''
      });
      setImagePreview(product.image || '');
    } else {
      setEditingProduct(null);
      setFormData({
        id: 'prod-' + Date.now(),
        name: '',
        categoryId: categories[0]?.id || '',
        price: '',
        packSize: '',
        inStock: true,
        featured: false,
        image: '',
        description: '',
        publicId: ''
      });
      setImagePreview('');
    }
    setImageFile(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
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
    formDataObj.append('folder', 'products');
    
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
    throw new Error(data.error || 'Cloudinary image upload failed');
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

      const payload = { 
        ...formData, 
        image: imageUrl, 
        publicId, 
        price: parseFloat(formData.price) 
      };
      const method = editingProduct ? 'PUT' : 'POST';
      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
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
        setUploadError(errData.error || 'Failed to save product');
      }
    } catch (err) {
      console.error(err);
      setUploadError(err.message || 'Error saving product');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product? Associated Cloudinary images will also be removed.")) return;
    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Product Management</h2>
          <p className="text-sm text-gray-500">Manage store catalog, prices, and product imagery with Cloudinary</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Product
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-md">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text"
              placeholder="Search products..."
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
                <th className="px-6 py-3 font-medium">Product</th>
                <th className="px-6 py-3 font-medium">Category</th>
                <th className="px-6 py-3 font-medium">Storage</th>
                <th className="px-6 py-3 font-medium">Price</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="6" className="text-center py-8 text-gray-500">Loading products...</td></tr>
              ) : filteredProducts.map(product => {
                const category = categories.find(c => c.id === product.categoryId);
                const isCloudinary = product.image && product.image.includes('cloudinary.com');
                return (
                  <tr key={product.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 flex items-center">
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-10 h-10 rounded object-cover border border-gray-200 mr-3"
                        onError={(e) => e.target.src = '/placeholder.png'}
                      />
                      <div>
                        <span className="font-medium text-gray-800 block">{product.name}</span>
                        <span className="text-xs text-gray-400">{product.packSize}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {category ? category.name : product.categoryId}
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
                    <td className="px-6 py-4 font-semibold text-gray-800">
                      ₹{product.price}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs rounded-full font-semibold ${
                        product.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => openModal(product)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded mr-2"
                        title="Edit product"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(product.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                        title="Delete product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {!loading && filteredProducts.length === 0 && (
                <tr><td colSpan="6" className="text-center py-8 text-gray-500">No products found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-800">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product ID</label>
                  <input 
                    type="text" 
                    required
                    readOnly={!!editingProduct}
                    className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none"
                    value={formData.id}
                    onChange={e => setFormData({...formData, id: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                  <input 
                    type="text" 
                    required
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select 
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                    value={formData.categoryId}
                    onChange={e => setFormData({...formData, categoryId: e.target.value})}
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    required
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pack Size (e.g. 500g, 1L, 10 Pack)</label>
                <input 
                  type="text" 
                  required
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                  value={formData.packSize}
                  onChange={e => setFormData({...formData, packSize: e.target.value})}
                />
              </div>
              
              {/* Cloudinary Image Upload Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Image (Cloudinary Managed)</label>
                
                {imagePreview ? (
                  <div className="relative mb-3 p-2 border border-gray-200 rounded-lg bg-gray-50 flex items-center gap-3">
                    <img 
                      src={imagePreview} 
                      alt="Product Preview" 
                      className="w-16 h-16 object-contain rounded border border-gray-300 bg-white"
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
                    <p className="text-xs text-gray-500">No image selected. Upload a product photo below.</p>
                  </div>
                )}

                <input 
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                  onChange={handleFileChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 cursor-pointer"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Supported formats: JPEG, PNG, WEBP, GIF, AVIF (Max 5MB).
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                <textarea 
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  rows="2"
                />
              </div>

              <div className="flex gap-4 pt-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={formData.inStock}
                    onChange={e => setFormData({...formData, inStock: e.target.checked})}
                    className="rounded text-green-600 focus:ring-green-500 w-4 h-4"
                  />
                  <span className="text-sm font-medium text-gray-700">In Stock</span>
                </label>
                
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={formData.featured}
                    onChange={e => setFormData({...formData, featured: e.target.checked})}
                    className="rounded text-green-600 focus:ring-green-500 w-4 h-4"
                  />
                  <span className="text-sm font-medium text-gray-700">Featured Product</span>
                </label>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
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
                    <span>Save Product</span>
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
