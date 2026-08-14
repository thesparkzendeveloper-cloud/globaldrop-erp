import React, { useState } from 'react';
import { Plus, Search, Package, AlertTriangle, CheckCircle, XCircle, ArrowRight, Filter, X } from 'lucide-react';
import { useDb } from '@/context/DbContext';
import type { Product } from '@/types';

const statusColors: Record<string, string> = {
  available: 'badge-green',
  'low-stock': 'badge-yellow',
  'out-of-stock': 'badge-red',
};

export default function InventoryPage() {
  const { products, branches, addProduct, addInventoryRequest } = useDb();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterBranch, setFilterBranch] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [showWorkflow, setShowWorkflow] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

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

  const handleAddProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const cost = parseFloat(formData.get('cost') as string) || 0;
    const price = parseFloat(formData.get('price') as string) || 0;
    const qty = parseInt(formData.get('availableQuantity') as string) || 0;
    const minStock = parseInt(formData.get('minimumStockLevel') as string) || 5;

    let computedStatus: Product['status'] = 'available';
    if (qty === 0) computedStatus = 'out-of-stock';
    else if (qty <= minStock) computedStatus = 'low-stock';

    const newProduct = {
      sku: formData.get('sku') as string,
      name: formData.get('name') as string,
      category: formData.get('category') as string,
      costPrice: cost,
      sellingPrice: price,
      availableQuantity: qty,
      reservedQuantity: 0,
      branch: formData.get('branch') as string,
      status: computedStatus
    };

    try {
      await addProduct(newProduct);
      setShowModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRequestSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedProduct) return;
    const formData = new FormData(e.currentTarget);
    const qty = parseInt(formData.get('quantity') as string) || 0;

    const reqData = {
      product: selectedProduct.name,
      quantity: qty,
      fromBranch: selectedProduct.branch || 'Main Warehouse',
      toBranch: formData.get('toBranch') as string,
      reason: formData.get('reason') as string,
      status: 'pending' as const,
      requestedBy: 'User',
      requestDate: new Date().toISOString().split('T')[0]
    };

    try {
      await addInventoryRequest(reqData);
      setSelectedProduct(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="page-enter">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-800">Inventory</h1>
          <p className="text-slate-500 mt-0.5 sm:mt-1 text-sm">Manage products and inventory transfers</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowWorkflow(true)} className="btn-secondary text-xs sm:text-sm">
            <ArrowRight size={16} /> <span className="hidden sm:inline">Workflow</span>
          </button>
          <button onClick={() => setShowModal(true)} className="btn-primary text-xs sm:text-sm">
            <Plus size={16} /> <span>Add</span>
          </button>
        </div>
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
              placeholder="Search products..."
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
              <th className="table-header hidden md:table-cell">Price</th>
              <th className="table-header text-right">Stock</th>
              <th className="table-header hidden sm:table-cell">Branch</th>
              <th className="table-header">Status</th>
              <th className="table-header text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredProducts.map(product => (
              <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                <td className="table-cell">
                  <div className="min-w-0">
                    <p className="font-medium text-slate-800 text-xs sm:text-sm truncate">{product.name}</p>
                    <p className="text-xs text-slate-500">{product.sku}</p>
                  </div>
                </td>
                <td className="table-cell hidden md:table-cell text-slate-600 text-xs sm:text-sm">${product.sellingPrice}</td>
                <td className="table-cell text-right">
                  <span className="font-medium text-xs sm:text-sm">{product.availableQuantity}</span>
                </td>
                <td className="table-cell hidden sm:table-cell text-slate-600 text-xs truncate max-w-[120px]">{product.branch}</td>
                <td className="table-cell">
                  <span className={statusColors[product.status]}>
                    {product.status === 'low-stock' ? 'Low' : product.status === 'out-of-stock' ? 'Out' : 'OK'}
                  </span>
                </td>
                <td className="table-cell text-right">
                  <button onClick={() => setSelectedProduct(product)} className="btn-secondary text-xs py-1 px-2 sm:py-1.5 sm:px-3">
                    Request
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showWorkflow && (
        <div className="modal-overlay" onClick={() => setShowWorkflow(false)}>
          <div className="modal-content p-4 sm:p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-slate-800">Inventory Workflow</h2>
              <button onClick={() => setShowWorkflow(false)} className="p-1.5 sm:p-2 hover:bg-slate-100 rounded-lg">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3 sm:space-y-4">
              {['Employee Request', 'Supervisor Approval', 'Inventory Transfer', 'Stock Updated'].map((step, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className="w-7 h-7 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 font-medium text-xs">{i + 1}</div>
                  <span className="text-xs sm:text-sm">{step}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2 sm:gap-3 mt-4 sm:mt-6">
              <button onClick={() => setShowWorkflow(false)} className="btn-secondary flex-1 justify-center">Close</button>
            </div>
          </div>
        </div>
      )}

      {selectedProduct && (
        <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
          <form onSubmit={handleRequestSubmit} className="modal-content p-4 sm:p-6 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-slate-800">Request Inventory</h2>
              <button type="button" onClick={() => setSelectedProduct(null)} className="p-1.5 sm:p-2 hover:bg-slate-100 rounded-lg">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3 sm:space-y-4">
              <div className="p-3 sm:p-4 bg-slate-50 rounded-lg">
                <p className="font-medium text-slate-800 text-sm sm:text-base">{selectedProduct.name}</p>
                <p className="text-xs text-slate-500">{selectedProduct.sku}</p>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">Available Stock: {selectedProduct.availableQuantity}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">Quantity</label>
                  <input type="number" name="quantity" className="form-input" placeholder="Qty" required />
                </div>
                <div>
                  <label className="form-label">Destination Branch</label>
                  <select name="toBranch" className="form-input" required>
                    {branches.filter(b => b.status === 'active' && b.name !== selectedProduct.branch).map(b => (
                      <option key={b.id} value={b.name}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="form-label">Reason</label>
                <textarea name="reason" className="form-input text-sm" rows={2} required />
              </div>
            </div>
            <div className="flex gap-2 sm:gap-3 mt-4 sm:mt-6">
              <button type="button" onClick={() => setSelectedProduct(null)} className="btn-secondary flex-1 justify-center">Cancel</button>
              <button type="submit" className="btn-primary flex-1 justify-center">Submit</button>
            </div>
          </form>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <form onSubmit={handleAddProduct} className="modal-content p-4 sm:p-6 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-slate-800">Add Product</h2>
              <button type="button" onClick={() => setShowModal(false)} className="p-1.5 sm:p-2 hover:bg-slate-100 rounded-lg">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">SKU</label>
                  <input type="text" name="sku" className="form-input" placeholder="SKU" required />
                </div>
                <div>
                  <label className="form-label">Category</label>
                  <select name="category" className="form-input">
                    <option value="Electronics">Electronics</option>
                    <option value="Furniture">Furniture</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Packaging">Packaging</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="form-label">Name</label>
                <input type="text" name="name" className="form-input" placeholder="Product name" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">Cost</label>
                  <input type="number" name="cost" className="form-input" placeholder="£0" required />
                </div>
                <div>
                  <label className="form-label">Price</label>
                  <input type="number" name="price" className="form-input" placeholder="£0" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">Initial Quantity</label>
                  <input type="number" name="availableQuantity" className="form-input" placeholder="0" required />
                </div>
                <div>
                  <label className="form-label">Minimum Stock Level</label>
                  <input type="number" name="minimumStockLevel" className="form-input" placeholder="10" required />
                </div>
              </div>
              <div>
                <label className="form-label">Branch</label>
                <select name="branch" className="form-input" required>
                  {branches.filter(b => b.status === 'active').map(b => (
                    <option key={b.id} value={b.name}>{b.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2 sm:gap-3 mt-4 sm:mt-6">
              <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
              <button type="submit" className="btn-primary flex-1 justify-center">Add</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

