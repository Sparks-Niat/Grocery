import React, { useState, useEffect } from 'react';
import { Layers, Plus, Edit, Trash2, AlertCircle, CheckCircle, Package } from 'lucide-react';
import { adminApi } from '../api';

export default function CategoriesTab() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    description: '',
    image: '/images/grocery.jpg'
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openAdd = () => {
    setModalMode('add');
    setFormData({
      id: '',
      name: '',
      description: '',
      image: '/images/grocery.jpg'
    });
    setError('');
    setIsModalOpen(true);
  };

  const openEdit = (cat) => {
    setModalMode('edit');
    setEditingCategory(cat);
    setFormData({
      id: cat.id,
      name: cat.name,
      description: cat.description || '',
      image: cat.image || '/images/grocery.jpg'
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Category name is required.');
      return;
    }

    try {
      setSubmitting(true);
      if (modalMode === 'add') {
        await adminApi.createCategory(formData);
      } else {
        await adminApi.updateCategory(editingCategory.id, formData);
      }
      setIsModalOpen(false);
      loadCategories();
    } catch (err) {
      setError(err.message || 'Operation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (cat) => {
    if (cat.productCount > 0) {
      alert(`Cannot delete "${cat.name}" because ${cat.productCount} products belong to it. Reassign those products first.`);
      return;
    }
    if (!window.confirm(`Are you sure you want to delete category "${cat.name}"?`)) return;

    try {
      await adminApi.deleteCategory(cat.id);
      loadCategories();
    } catch (err) {
      alert(`Failed to delete category: ${err.message}`);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <span>Store Categories</span>
            <span className="text-sm font-bold bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full">
              {categories.length} Total
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Organize the 91 Kirana items across intuitive customer-facing aisles
          </p>
        </div>

        <button
          onClick={openAdd}
          className="inline-flex items-center space-x-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition active:scale-95"
        >
          <Plus size={15} />
          <span>Add Category</span>
        </button>
      </div>

      {/* Grid of Categories */}
      {loading ? (
        <div className="p-12 text-center">
          <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 flex flex-col justify-between hover:border-amber-400 hover:shadow-md transition"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-display font-bold text-slate-900 text-base">
                    {cat.name}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-extrabold shrink-0 flex items-center space-x-1">
                    <Package size={11} />
                    <span>{cat.productCount ?? 0} items</span>
                  </span>
                </div>
                <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                  {cat.description || 'Kirana department items'}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-mono text-[11px]">
                  ID: {cat.id}
                </span>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => openEdit(cat)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition"
                    title="Edit Category"
                  >
                    <Edit size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(cat)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                    title="Delete Category"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Add / Edit Category */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            <h3 className="font-display font-bold text-lg text-slate-900">
              {modalMode === 'add' ? 'Add New Category' : `Edit Category`}
            </h3>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center space-x-2">
                <AlertCircle size={15} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Snacks, Biscuits, Shampoos"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Description
                </label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description for customer view..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
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
                  {submitting ? 'Saving...' : modalMode === 'add' ? 'Create' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
