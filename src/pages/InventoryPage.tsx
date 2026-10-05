import React, { useState } from 'react';
import { Plus, Search, Package, AlertTriangle, CheckCircle, XCircle, X, Pencil, Trash2 } from 'lucide-react';
import { useDb } from '@/context/DbContext';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency, getCurrencySymbol } from '@/utils/currency';
import type { Product } from '@/types';

const statusColors: Record<string, string> = {
  available: 'badge-green',
  'low-stock': 'badge-yellow',
  'out-of-stock': 'badge-red',
};

export default function InventoryPage() {
  const { products, branches, addProduct, updateProduct, deleteProduct } = useDb();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isAuthorizedToEdit = user?.role === 'admin' || user?.role === 'supervisor';

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterBranch, setFilterBranch] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [customCategory, setCustomCategory] = useState('');
  const [categoryMode, setCategoryMode] = useState<'select' | 'custom'>('select');

  const stats = {
    total: products.length,
    available: products.filter(p => p.status === 'available').length,
    lowStock: products.filter(p => p.status === 'low-stock').length,
    outOfStock: products.filter(p => p.status === 'out-of-stock').length,
  };

  const filteredProducts = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || p.status === filterStatus;
    const matchBranch = filterBranch === 'all' || p.branch === filterBranch;
    return matchSearch && matchStatus && matchBranch;
  });

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setCategoryMode('select');
    setCustomCategory('');
    setShowModal(true);
  };

  const handleOpenEditModal = (product: Product, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingProduct(product);
    setCategoryMode('select');
    setCustomCategory('');
    setShowModal(true);
  };

  const handleDeleteProduct = async (product: Product, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${product.name}" (${product.sku})?`)) {
      try {
        await deleteProduct(product.id);
      } catch (err) {
        console.error('Failed to delete product:', err);
      }
    }
  };

  const handleSaveProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const cost = parseFloat(formData.get('cost') as string) || 0;
    const price = parseFloat(formData.get('price') as string) || 0;
    const qty = parseInt(formData.get('availableQuantity') as string) || 0;
    const minStock = parseInt(formData.get('minimumStockLevel') as string) || 5;

    let computedStatus: Product['status'] = 'available';
    if (qty === 0) computedStatus = 'out-of-stock';
    else if (qty <= minStock) computedStatus = 'low-stock';

    const categoryValue = categoryMode === 'custom' && customCategory.trim() 
      ? customCategory.trim() 
      : (formData.get('category') as string || 'General');

    const productPayload = {
      sku: formData.get('sku') as string,
      name: formData.get('name') as string,
      category: categoryValue,
      costPrice: cost,
      sellingPrice: price,
      availableQuantity: qty,
      reservedQuantity: editingProduct ? editingProduct.reservedQuantity : 0,
      branch: formData.get('branch') as string,
      status: computedStatus,
      notes: (formData.get('notes') as string || '').trim()
    };

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, productPayload);
      } else {
        await addProduct(productPayload);
      }
      setShowModal(false);
      setEditingProduct(null);
      setCustomCategory('');
      setCategoryMode('select');
    } catch (err) {
      console.error('Failed to save product:', err);
    }
  };

  // Build category list from existing products + defaults
  const DEFAULT_CATEGORIES = ['Electronics', 'Furniture', 'Accessories', 'Packaging', 'Clothing', 'Food & Beverage', 'Tools', 'Office Supplies'];
  const productCategories = Array.from(new Set(products.map(p => p.category).filter(Boolean)));
  const allCategories = Array.from(new Set([...DEFAULT_CATEGORIES, ...productCategories])).sort();

  return (
    <div className="page-enter">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-800">Inventory</h1>
          <p className="text-slate-500 mt-0.5 sm:mt-1 text-sm">Manage products, stock levels, and edit inventory details</p>
        </div>
        {isAuthorizedToEdit && (
          <div className="flex gap-2">
            <button onClick={handleOpenAddModal} className="btn-primary text-xs sm:text-sm">
              <Plus size={16} /> <span>Add Product</span>
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-6">
        <div className="card p-3 sm:p-5">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 bg-blue-100 rounded-lg sm:rounded-xl">
              <Package size={18} className="text-blue-600 sm:hidden" />
              <Package size={24} className="text-blue-600 hidden sm:block" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-slate-500">Total</p>
              <p className="text-lg sm:text-2xl font-semibold text-slate-800">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="card p-3 sm:p-5">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 bg-emerald-100 rounded-lg sm:rounded-xl">
              <CheckCircle size={18} className="text-emerald-600 sm:hidden" />
              <CheckCircle size={24} className="text-emerald-600 hidden sm:block" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-slate-500">Available</p>
              <p className="text-lg sm:text-2xl font-semibold text-emerald-600">{stats.available}</p>
            </div>
          </div>
        </div>
        <div className="card p-3 sm:p-5">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 bg-amber-100 rounded-lg sm:rounded-xl">
              <AlertTriangle size={18} className="text-amber-600 sm:hidden" />
              <AlertTriangle size={24} className="text-amber-600 hidden sm:block" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-slate-500">Low Stock</p>
              <p className="text-lg sm:text-2xl font-semibold text-amber-600">{stats.lowStock}</p>
            </div>
          </div>
        </div>
        <div className="card p-3 sm:p-5">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 bg-red-100 rounded-lg sm:rounded-xl">
              <XCircle size={18} className="text-red-600 sm:hidden" />
              <XCircle size={24} className="text-red-600 hidden sm:block" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-slate-500">Out</p>
              <p className="text-lg sm:text-2xl font-semibold text-red-600">{stats.outOfStock}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex flex-col gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search products by name or SKU..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="form-input pl-8 sm:pl-10"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 sm:mx-0 sm:px-0 sm:pb-0">
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="form-input flex-1 sm:flex-none sm:w-28">
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="low-stock">Low Stock</option>
              <option value="out-of-stock">Out of Stock</option>
            </select>
            <select value={filterBranch} onChange={e => setFilterBranch(e.target.value)} className="form-input flex-1 sm:flex-none sm:w-32">
              <option value="all">All Branches</option>
              {branches.filter(b => b.status === 'active').map(b => (
                <option key={b.id} value={b.name}>{b.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="card overflow-x-auto -mx-3 sm:mx-0">
        <table className="w-full min-w-[600px]">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="table-header">Product</th>
              <th className="table-header hidden md:table-cell">Category</th>
              <th className="table-header hidden md:table-cell">Price</th>
              <th className="table-header text-right">Stock</th>
              <th className="table-header hidden sm:table-cell">Branch</th>
              <th className="table-header">Status</th>
              {isAuthorizedToEdit && <th className="table-header text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={isAuthorizedToEdit ? 7 : 6} className="table-cell text-center text-slate-400 py-6">
                  No inventory products found.
                </td>
              </tr>
            ) : filteredProducts.map(product => (
              <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                <td className="table-cell">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 text-xs sm:text-sm truncate">{product.name}</p>
                    <p className="text-xs text-slate-500 font-mono">{product.sku}</p>
                  </div>
                </td>
                <td className="table-cell hidden md:table-cell text-slate-600 text-xs sm:text-sm">
                  <span className="badge-slate text-xs">{product.category}</span>
                </td>
                <td className="table-cell hidden md:table-cell text-slate-700 font-semibold text-xs sm:text-sm">
                  {formatCurrency(product.sellingPrice, user?.role)}
                </td>
                <td className="table-cell text-right">
                  <span className="font-bold text-xs sm:text-sm">{product.availableQuantity}</span>
                </td>
                <td className="table-cell hidden sm:table-cell text-slate-600 text-xs truncate max-w-[120px]">{product.branch}</td>
                <td className="table-cell">
                  <span className={statusColors[product.status]}>
                    {product.status === 'low-stock' ? 'Low' : product.status === 'out-of-stock' ? 'Out' : 'OK'}
                  </span>
                </td>
                {isAuthorizedToEdit && (
                  <td className="table-cell text-right">
                    <div className="flex items-center justify-end gap-1.5" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={(e) => handleOpenEditModal(product, e)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit Product Details"
                      >
                        <Pencil size={15} />
                      </button>
                      {isAdmin && (
                        <button
                          onClick={(e) => handleDeleteProduct(product, e)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Product Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <form onSubmit={handleSaveProduct} className="modal-content p-4 sm:p-6 max-h-[88vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4 sm:mb-6 border-b pb-3">
              <h2 className="text-lg sm:text-xl font-semibold text-slate-800">
                {editingProduct ? `Edit Product (${editingProduct.sku})` : 'Add New Product'}
              </h2>
              <button type="button" onClick={() => setShowModal(false)} className="p-1.5 sm:p-2 hover:bg-slate-100 rounded-lg">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">SKU *</label>
                  <input
                    type="text"
                    name="sku"
                    className="form-input font-mono"
                    placeholder="SKU-1001"
                    defaultValue={editingProduct?.sku || ''}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Category *</label>
                  {categoryMode === 'select' ? (
                    <select
                      name="category"
                      className="form-input"
                      defaultValue={editingProduct?.category || allCategories[0] || 'Electronics'}
                      onChange={e => {
                        if (e.target.value === '__new__') {
                          setCategoryMode('custom');
                          setCustomCategory('');
                        }
                      }}
                    >
                      {allCategories.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                      <option value="__new__">＋ Add new category...</option>
                    </select>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        name="category"
                        className="form-input flex-1"
                        placeholder="Type new category name"
                        value={customCategory}
                        onChange={e => setCustomCategory(e.target.value)}
                        autoFocus
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setCategoryMode('select')}
                        className="px-2 py-1 text-xs text-slate-500 hover:text-slate-700 border border-slate-200 rounded-lg"
                        title="Back to list"
                      >
                        ↩
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="form-label">Product Name *</label>
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  placeholder="Product name"
                  defaultValue={editingProduct?.name || ''}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">Cost Price ({getCurrencySymbol(user?.role)})</label>
                  <input
                    type="number"
                    step="0.01"
                    name="cost"
                    className="form-input"
                    placeholder={`${getCurrencySymbol(user?.role)}0`}
                    defaultValue={editingProduct?.costPrice ?? 0}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Selling Price ({getCurrencySymbol(user?.role)}) *</label>
                  <input
                    type="number"
                    step="0.01"
                    name="price"
                    className="form-input font-semibold"
                    placeholder={`${getCurrencySymbol(user?.role)}0`}
                    defaultValue={editingProduct?.sellingPrice ?? 0}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">Available Stock Quantity *</label>
                  <input
                    type="number"
                    min="0"
                    name="availableQuantity"
                    className="form-input"
                    placeholder="0"
                    defaultValue={editingProduct?.availableQuantity ?? 0}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Minimum Stock Alert Level</label>
                  <input
                    type="number"
                    min="0"
                    name="minimumStockLevel"
                    className="form-input"
                    placeholder="10"
                    defaultValue={editingProduct ? (editingProduct.status === 'low-stock' ? 10 : 5) : 10}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="form-label">Branch *</label>
                <select
                  name="branch"
                  className="form-input"
                  defaultValue={editingProduct?.branch || (branches.find(b => b.status === 'active')?.name || 'India Branch')}
                  required
                >
                  {branches.filter(b => b.status === 'active').map(b => (
                    <option key={b.id} value={b.name}>{b.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">Notes / Special Instructions</label>
                <textarea
                  name="notes"
                  className="form-input text-xs sm:text-sm"
                  rows={2}
                  defaultValue={editingProduct?.notes || ''}
                  placeholder="Add product notes or details..."
                />
              </div>
            </div>
            <div className="flex gap-2 sm:gap-3 mt-4 sm:mt-6 pt-2 border-t border-slate-100 justify-end">
              <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary">
                {editingProduct ? 'Save Changes' : 'Add Product'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}


