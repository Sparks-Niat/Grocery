import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, X } from 'lucide-react';

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
    description: ''
  });

  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);

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
    if (product) {
      setEditingProduct(product);
      setFormData(product);
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
        description: ''
      });
    }
    setImageFile(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
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
      return data.url; // /uploads/filename.jpg
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

      const payload = { ...formData, image: imageUrl, price: parseFloat(formData.price) };
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
        alert("Failed to save product");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving product");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
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
        <h2 className="text-2xl font-bold text-gray-800">Product Management</h2>
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
                <th className="px-6 py-3 font-medium">Price</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="5" className="text-center py-8">Loading...</td></tr>
              ) : filteredProducts.map(product => (
                <tr key={product.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 flex items-center">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-10 h-10 rounded object-cover border border-gray-200 mr-3"
                      onError={(e) => e.target.src = '/placeholder.png'}
                    />
                    <div>
                      <p className="font-medium text-gray-800">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.packSize}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {categories.find(c => c.id === product.categoryId)?.name || product.categoryId}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-800">
                    ₹{product.price}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${product.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {product.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => openModal(product)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg mr-2"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(product.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && filteredProducts.length === 0 && (
                <tr><td colSpan="5" className="text-center py-8 text-gray-500">No products found.</td></tr>
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
            
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select 
                    required
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                    value={formData.categoryId}
                    onChange={e => setFormData({...formData, categoryId: e.target.value})}
                  >
                    <option value="" disabled>Select category</option>
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pack Size (e.g., 1 kg, 500g)</label>
                  <input 
                    type="text" 
                    required
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                    value={formData.packSize}
                    onChange={e => setFormData({...formData, packSize: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image Upload</label>
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
              </div>

              <div className="flex gap-4 mt-4">
                <label className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    checked={formData.inStock}
                    onChange={e => setFormData({...formData, inStock: e.target.checked})}
                    className="rounded text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm font-medium text-gray-700">In Stock</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    checked={formData.featured}
                    onChange={e => setFormData({...formData, featured: e.target.checked})}
                    className="rounded text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Featured Product</span>
                </label>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
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
                  {uploading ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
