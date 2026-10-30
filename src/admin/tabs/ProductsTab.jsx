import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Filter, Edit, Trash2, CheckCircle, AlertTriangle, 
  Download, Upload, RefreshCw, X, Image as ImageIcon, IndianRupee,
  ChevronLeft, ChevronRight, AlertCircle, ArrowUpDown
} from 'lucide-react';
import { adminApi } from '../api';

export default function ProductsTab({ initialFilter, initialEditId, initialOpenAdd }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [stockFilter, setStockFilter] = useState(
    initialFilter === 'instock' ? 'instock' : 'all'
  );
  const [priceFilter, setPriceFilter] = useState(
    initialFilter === 'provisional' ? 'provisional' : 'all'
  );
  const [sortOption, setSortOption] = useState('name-asc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Selection for bulk actions
  const [selectedIds, setSelectedIds] = useState([]);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteConfirmProduct, setDeleteConfirmProduct] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    categoryId: 'snacks',
    subcategory: '',
    brand: '',
    packSize: '1 Pack',
    price: '',
    priceNote: 'verified',
    variants: [],
    inStock: true,
    stock: 25,
    lowStockThreshold: 5,
    image: '',
    description: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Load products & categories
  const fetchData = async () => {
    try {
      setLoading(true);
      const [prods, cats] = await Promise.all([
        adminApi.getProducts(),
        adminApi.getCategories()
      ]);
      setProducts(prods);
      setCategories(cats);

      // Handle initial edit id if provided
      if (initialEditId) {
        const target = prods.find(p => p.id === initialEditId);
        if (target) {
          openEditModal(target);
        }
      } else if (initialOpenAdd) {
        openAddModal();
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter & Search logic
  const filteredProducts = products.filter(p => {
    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchBrand = p.brand && p.brand.toLowerCase().includes(q);
      const matchSub = p.subcategory && p.subcategory.toLowerCase().includes(q);
      const matchPack = p.packSize && p.packSize.toLowerCase().includes(q);
      if (!matchName && !matchBrand && !matchSub && !matchPack) return false;
    }

    // Category
    if (selectedCategory !== 'all' && p.categoryId !== selectedCategory) {
      return false;
    }

    // Stock Filter
    if (stockFilter === 'instock' && (!p.inStock || p.stock === 0)) return false;
    if (stockFilter === 'outofstock' && p.inStock && p.stock > 0) return false;
    if (stockFilter === 'lowstock') {
      const isLow = p.stock !== undefined && p.stock > 0 && p.stock <= (p.lowStockThreshold || 5);
      if (!isLow) return false;
    }

    // Price Filter
    if (priceFilter === 'verified' && p.priceNote === 'provisional') return false;
    if (priceFilter === 'provisional' && p.priceNote !== 'provisional') return false;

    return true;
  });

  // Sorting logic
  filteredProducts.sort((a, b) => {
    if (sortOption === 'name-asc') return a.name.localeCompare(b.name);
    if (sortOption === 'name-desc') return b.name.localeCompare(a.name);
    if (sortOption === 'price-asc') return (a.price || 0) - (b.price || 0);
    if (sortOption === 'price-desc') return (b.price || 0) - (a.price || 0);
    if (sortOption === 'stock-asc') return (a.stock || 0) - (b.stock || 0);
    if (sortOption === 'stock-desc') return (b.stock || 0) - (a.stock || 0);
    return 0;
  });

  // Pagination calculation
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Selection handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(paginatedProducts.map(p => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Bulk Actions
  const handleBulkAction = async (action, payload = {}) => {
    if (selectedIds.length === 0) return;
    try {
      await adminApi.bulkUpdateProducts(action, selectedIds, payload);
      setSelectedIds([]);
      fetchData();
    } catch (err) {
      alert(`Bulk action failed: ${err.message}`);
    }
  };

  // Modal Openers
  const openAddModal = () => {
    setModalMode('add');
    setFormData({
      id: `prod-${Date.now()}`,
      name: '',
      categoryId: categories[0]?.id || 'snacks',
      subcategory: '',
      brand: '',
      packSize: '1 Unit',
      price: '',
      priceNote: 'verified',
      variants: [],
      inStock: true,
      stock: 25,
      lowStockThreshold: 5,
      image: '/images/grocery.jpg',
      description: ''
    });
    setImageFile(null);
    setImagePreview('/images/grocery.jpg');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setModalMode('edit');
    setEditingProduct(product);
    setFormData({
      id: product.id,
      name: product.name,
      categoryId: product.categoryId,
      subcategory: product.subcategory || '',
      brand: product.brand || '',
      packSize: product.packSize,
      price: product.price,
      priceNote: product.priceNote || 'verified',
      variants: product.variants ? [...product.variants] : [],
      inStock: product.inStock,
      stock: product.stock ?? 25,
      lowStockThreshold: product.lowStockThreshold ?? 5,
      image: product.image,
      description: product.description || ''
    });
    setImageFile(null);
    setImagePreview(product.image);
    setFormError('');
    setIsModalOpen(true);
  };

  // Image upload preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Form Submit
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim() || formData.price === '') {
      setFormError('Product name and price are required.');
      return;
    }

    try {
      setSubmitting(true);
      let finalImageUrl = formData.image;

      // If user uploaded a new local file, upload to backend first
      if (imageFile) {
        const uploadRes = await adminApi.uploadImage(imageFile);
        if (uploadRes && uploadRes.imageUrl) {
          finalImageUrl = uploadRes.imageUrl;
        }
      }

      const payload = {
        ...formData,
        price: Number(formData.price),
        stock: Number(formData.stock),
        lowStockThreshold: Number(formData.lowStockThreshold),
        image: finalImageUrl
      };

      if (modalMode === 'add') {
        await adminApi.createProduct(payload);
      } else {
        await adminApi.updateProduct(editingProduct.id, payload);
      }

      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      setFormError(err.message || 'Failed to save product.');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Action
  const handleDeleteProduct = async () => {
    if (!deleteConfirmProduct) return;
    try {
      await adminApi.deleteProduct(deleteConfirmProduct.id);
      setDeleteConfirmProduct(null);
      fetchData();
    } catch (err) {
      alert(`Failed to delete product: ${err.message}`);
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'Category', 'Subcategory', 'Brand', 'Pack Size', 'Price', 'Price Status', 'Stock', 'In Stock'];
    const rows = products.map(p => [
      `"${p.id}"`,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.categoryId}"`,
      `"${p.subcategory || ''}"`,
      `"${p.brand || ''}"`,
      `"${p.packSize}"`,
      p.price,
      p.priceNote || 'verified',
      p.stock ?? 0,
      p.inStock ? 'Yes' : 'No'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sri_manikanta_sai_products_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <span>Product Inventory</span>
            <span className="text-sm font-bold bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full">
              {filteredProducts.length} of {products.length}
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage prices, stock levels, variants, and product images
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center space-x-1.5 px-3 py-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-bold rounded-xl shadow-xs transition"
            title="Export all products to CSV"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>

          <button
            onClick={openAddModal}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition active:scale-95"
          >
            <Plus size={15} />
            <span>Add New Item</span>
          </button>
        </div>
      </div>

      {/* Search, Category & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search box */}
          <div className="relative lg:col-span-2">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search product name, brand, dal, shampoo..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-400 focus:bg-white transition"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-700 focus:outline-none focus:border-amber-400 focus:bg-white transition"
            >
              <option value="all">All Categories ({categories.length})</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Stock Filter */}
          <div>
            <select
              value={stockFilter}
              onChange={(e) => {
                setStockFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-700 focus:outline-none focus:border-amber-400 focus:bg-white transition"
            >
              <option value="all">All Stock Status</option>
              <option value="instock">In Stock</option>
              <option value="lowstock">Low Stock (≤ 5)</option>
              <option value="outofstock">Out of Stock</option>
            </select>
          </div>

          {/* Price Verification Filter */}
          <div>
            <select
              value={priceFilter}
              onChange={(e) => {
                setPriceFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-700 focus:outline-none focus:border-amber-400 focus:bg-white transition"
            >
              <option value="all">All Price Types</option>
              <option value="verified">Verified Prices</option>
              <option value="provisional">Est. Prices (Need Review)</option>
            </select>
          </div>
        </div>

        {/* Quick Bulk Action Bar when items selected */}
        {selectedIds.length > 0 && (
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-bold text-slate-700">
              {selectedIds.length} item(s) selected:
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => handleBulkAction('setInStock', { inStock: true })}
                className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-lg border border-emerald-200 hover:bg-emerald-100 transition"
              >
                Mark In Stock
              </button>
              <button
                onClick={() => handleBulkAction('setInStock', { inStock: false })}
                className="px-2.5 py-1 bg-rose-50 text-rose-700 font-bold rounded-lg border border-rose-200 hover:bg-rose-100 transition"
              >
                Mark Out of Stock
              </button>
              <button
                onClick={() => handleBulkAction('setPriceVerified')}
                className="px-2.5 py-1 bg-amber-50 text-amber-700 font-bold rounded-lg border border-amber-200 hover:bg-amber-100 transition"
              >
                Mark Prices Verified
              </button>
              <button
                onClick={() => setSelectedIds([])}
                className="px-2 py-1 text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-500">Loading catalog items...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <AlertCircle size={36} className="mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-semibold text-slate-700">No products match the filter criteria</p>
            <p className="text-xs text-slate-400 mt-1">Try resetting filters or searching a different term.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4 w-10">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === paginatedProducts.length && paginatedProducts.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-slate-300 text-amber-500 focus:ring-amber-400"
                    />
                  </th>
                  <th className="py-3 px-3 w-16">Image</th>
                  <th className="py-3 px-4">Product Details</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {paginatedProducts.map(p => {
                  const isLow = p.stock !== undefined && p.stock <= (p.lowStockThreshold || 5);
                  const isOut = !p.inStock || p.stock === 0;

                  return (
                    <tr 
                      key={p.id}
                      className="hover:bg-slate-50/60 transition group"
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 px-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(p.id)}
                          onChange={() => handleSelectOne(p.id)}
                          className="rounded border-slate-300 text-amber-500 focus:ring-amber-400"
                        />
                      </td>

                      {/* Image Thumbnail */}
                      <td className="py-3.5 px-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 p-1 flex items-center justify-center overflow-hidden">
                          <img
                            src={p.image}
                            alt=""
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/images/grocery.jpg';
                            }}
                          />
                        </div>
                      </td>

                      {/* Name & Subtitle */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 group-hover:text-amber-700 transition">
                          {p.name}
                        </div>
                        <div className="text-xs text-slate-400 flex items-center space-x-2 mt-0.5">
                          <span>{p.packSize}</span>
                          {p.brand && (
                            <>
                              <span>•</span>
                              <span className="font-medium text-slate-500">{p.brand}</span>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Category & Subcategory */}
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">
                          {categories.find(c => c.id === p.categoryId)?.name || p.categoryId}
                        </span>
                        {p.subcategory && (
                          <div className="text-[11px] text-slate-400 mt-0.5">{p.subcategory}</div>
                        )}
                      </td>

                      {/* Price & Price Note */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 flex items-center space-x-1">
                          <span>₹{p.price}</span>
                          {p.variants && p.variants.length > 1 && (
                            <span className="text-[10px] text-slate-400 font-normal">
                              ({p.variants.map(v => `₹${v.price}`).join(', ')})
                            </span>
                          )}
                        </div>
                        {p.priceNote === 'provisional' ? (
                          <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 mt-1">
                            <AlertCircle size={10} />
                            <span>Estimated*</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-0.5 text-[10px] font-semibold text-emerald-700 mt-0.5">
                            <CheckCircle size={10} />
                            <span>Verified</span>
                          </span>
                        )}
                      </td>

                      {/* Stock Level */}
                      <td className="py-3.5 px-4">
                        {isOut ? (
                          <span className="inline-block px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold rounded-full">
                            Out of Stock
                          </span>
                        ) : isLow ? (
                          <span className="inline-block px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold rounded-full">
                            {p.stock ?? 0} (Low)
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full">
                            {p.stock ?? 25} in store
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center space-x-1">
                          <button
                            onClick={() => openEditModal(p)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition"
                            title="Edit Product"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmProduct(p)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                            title="Delete Product"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
            {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of{' '}
            {filteredProducts.length} entries
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-2 font-bold text-slate-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ADD / EDIT PRODUCT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-display font-bold text-lg text-slate-900">
                {modalMode === 'add' ? 'Add New Kirana Product' : `Edit "${editingProduct?.name}"`}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center space-x-2">
                  <AlertCircle size={16} />
                  <span>{formError}</span>
                </div>
              )}

              {/* Product Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Good Day Biscuits"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              {/* Category & Subcategory */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-amber-400 focus:outline-none"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Subcategory
                  </label>
                  <input
                    type="text"
                    value={formData.subcategory}
                    onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                    placeholder="e.g. Biscuits, Dals, Spices"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Brand & Pack Size */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Brand
                  </label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="e.g. Britannia, Cadbury, Tata"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Pack Size / Unit *
                  </label>
                  <input
                    type="text"
                    value={formData.packSize}
                    onChange={(e) => setFormData({ ...formData, packSize: e.target.value })}
                    placeholder="e.g. 500g, 1 Packet, 1 Bottle"
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Price & Price Verification Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Selling Price (₹ INR) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="e.g. 25"
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Price Verification Status
                  </label>
                  <select
                    value={formData.priceNote}
                    onChange={(e) => setFormData({ ...formData, priceNote: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-amber-400 focus:outline-none font-semibold"
                  >
                    <option value="verified">Verified (Official Store Price)</option>
                    <option value="provisional">Provisional (Estimated, Needs Review)</option>
                  </select>
                </div>
              </div>

              {/* Stock Quantity & Threshold */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value, inStock: Number(e.target.value) > 0 })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Low Stock Threshold
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.lowStockThreshold}
                    onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Product Image Upload or URL */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Product Image
                </label>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                    <img
                      src={imagePreview || formData.image || '/images/grocery.jpg'}
                      alt=""
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-50 file:text-amber-800 hover:file:bg-amber-100 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.image}
                      onChange={(e) => {
                        setFormData({ ...formData, image: e.target.value });
                        setImagePreview(e.target.value);
                      }}
                      placeholder="Or enter image URL"
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* In-Stock Toggle */}
              <div className="pt-2 flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="inStockToggle"
                  checked={formData.inStock}
                  onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                  className="rounded border-slate-300 text-amber-500 focus:ring-amber-400 h-4 w-4"
                />
                <label htmlFor="inStockToggle" className="text-sm font-semibold text-slate-800">
                  Visible & Available for Sale in Store
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-200 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl shadow-xs transition active:scale-95 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : modalMode === 'add' ? 'Create Product' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 p-6 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 font-display">
              Delete Product?
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Are you sure you want to remove <span className="font-bold text-slate-800">"{deleteConfirmProduct.name}"</span> from the store inventory? This action is recorded in the activity log.
            </p>
            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                onClick={() => setDeleteConfirmProduct(null)}
                className="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProduct}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition active:scale-95"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
