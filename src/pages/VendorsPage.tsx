import React, { useState } from 'react';
import { Plus, Search, Star, Phone, Mail, Package, X, Pencil, Power } from 'lucide-react';
import { useDb } from '@/context/DbContext';
import type { Vendor } from '@/types';

export default function VendorsPage() {
  const { vendors, countries, products: inventoryProducts, addVendor, updateVendor } = useDb();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

  const filteredVendors = vendors.filter(v =>
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    v.country.toLowerCase().includes(search.toLowerCase())
  );

  const renderStars = (rating: number) =>
    Array(5).fill(0).map((_, i) => (
      <Star key={i} size={12} className={i < Math.floor(rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'} />
    ));

  const handleToggleStatus = async (vendor: Vendor) => {
    try {
      await updateVendor(vendor.id, { status: vendor.status === 'active' ? 'inactive' : 'active' });
    } catch (err) { console.error(err); }
  };

  const openAdd = () => { setSelectedVendor(null); setShowModal(true); };
  const openEdit = (v: Vendor) => { setSelectedVendor(v); setShowModal(true); };
  const openView = (v: Vendor) => { setSelectedVendor(v); setShowModal(false); };
  const closeModal = () => { setShowModal(false); setSelectedVendor(null); };

  const handleSave = async (data: Omit<Vendor, 'id' | 'rating' | 'status'>) => {
    try {
      if (selectedVendor && showModal) {
        await updateVendor(selectedVendor.id, data);
      } else {
        await addVendor({ ...data, rating: 5, status: 'active' });
      }
      closeModal();
    } catch (err) { console.error(err); }
  };

  const isViewMode = !!selectedVendor && !showModal;

  return (
    <div className="page-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-800">Vendors</h1>
          <p className="text-slate-500 mt-0.5 sm:mt-1 text-sm">Manage suppliers and vendor relationships</p>
        </div>
        <button onClick={openAdd} className="btn-primary w-full sm:w-auto">
          <Plus size={16} /> <span>Add Vendor</span>
        </button>
      </div>

      {/* Search */}
      <div className="card p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="relative">
          <Search size={16} className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search vendors..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="form-input pl-8 sm:pl-10"
          />
        </div>
      </div>

      {/* Vendor Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        {filteredVendors.map(vendor => (
          <div key={vendor.id} className="card p-3 sm:p-4 lg:p-6 hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-3 sm:mb-4">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg sm:rounded-xl flex items-center justify-center text-white text-xs sm:text-sm font-semibold flex-shrink-0">
                  {vendor.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-slate-800 text-sm sm:text-base truncate">{vendor.name}</h3>
                  <div className="flex items-center gap-0.5 mt-0.5">{renderStars(vendor.rating)}</div>
                </div>
              </div>
              <span className={vendor.status === 'active' ? 'badge-green' : 'badge-red'}>{vendor.status}</span>
            </div>

            <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4 text-xs sm:text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <Mail size={12} className="text-slate-400 flex-shrink-0" />
                <span className="truncate">{vendor.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={12} className="text-slate-400 flex-shrink-0" />
                <span>{vendor.phone}</span>
              </div>
            </div>

            <div className="mb-3 sm:mb-4">
              <p className="text-xs text-slate-500 mb-1.5 sm:mb-2">Products</p>
              <div className="flex flex-wrap gap-1">
                {vendor.products.slice(0, 2).map(p => (
                  <span key={p} className="badge-slate text-xs">{p.length > 12 ? p.slice(0, 12) + '..' : p}</span>
                ))}
                {vendor.products.length > 2 && <span className="badge-blue text-xs">+{vendor.products.length - 2}</span>}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-slate-100">
              <button onClick={() => openView(vendor)} className="text-xs text-blue-600 hover:underline">View</button>
              <div className="flex gap-1 sm:gap-2">
                <button onClick={() => openEdit(vendor)} className="p-1.5 sm:p-2 hover:bg-slate-100 rounded-lg text-slate-500">
                  <Pencil size={14} />
                </button>
                <button onClick={() => handleToggleStatus(vendor)} className="p-1.5 sm:p-2 hover:bg-slate-100 rounded-lg text-slate-500">
                  <Power size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {(showModal || selectedVendor) && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content p-4 sm:p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-slate-800">
                {isViewMode ? 'Vendor Profile' : selectedVendor ? 'Edit Vendor' : 'Add Vendor'}
              </h2>
              <button onClick={closeModal} className="p-1.5 sm:p-2 hover:bg-slate-100 rounded-lg">
                <X size={18} />
              </button>
            </div>

            {/* View Profile */}
            {isViewMode ? (
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-slate-50 rounded-lg">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg sm:rounded-xl flex items-center justify-center text-white font-semibold text-sm sm:text-lg">
                    {selectedVendor!.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-slate-800 text-sm sm:text-lg">{selectedVendor!.name}</h3>
                    <div className="flex items-center gap-0.5 mt-0.5">{renderStars(selectedVendor!.rating)}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:gap-4 p-3 sm:p-4 border rounded-lg text-xs sm:text-sm">
                  <div><span className="text-slate-500">Email</span><p className="font-medium truncate">{selectedVendor!.email}</p></div>
                  <div><span className="text-slate-500">Phone</span><p className="font-medium">{selectedVendor!.phone}</p></div>
                  <div><span className="text-slate-500">Country</span><p className="font-medium">{selectedVendor!.country}</p></div>
                  <div><span className="text-slate-500">Status</span><span className={selectedVendor!.status === 'active' ? 'badge-green' : 'badge-red'}>{selectedVendor!.status}</span></div>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-2">Products Supplied</p>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {selectedVendor!.products.map(p => (
                      <span key={p} className="badge-slate text-xs flex items-center gap-1">
                        <Package size={10} />{p}
                      </span>
                    ))}
                  </div>
                </div>
                <button onClick={closeModal} className="btn-secondary w-full justify-center mt-2">Close</button>
              </div>
            ) : (
              /* Add / Edit Form */
              <VendorForm
                key={selectedVendor?.id ?? 'new'}
                vendor={selectedVendor}
                countries={countries}
                inventoryProducts={inventoryProducts.map(p => p.name)}
                onClose={closeModal}
                onSave={handleSave}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ──────────────── Vendor Add / Edit Form ──────────────── */
function VendorForm({
  vendor,
  countries,
  inventoryProducts,
  onClose,
  onSave,
}: {
  vendor: Vendor | null;
  countries: { id: string; name: string; status: string }[];
  inventoryProducts: string[];
  onClose: () => void;
  onSave: (data: Omit<Vendor, 'id' | 'rating' | 'status'>) => Promise<void>;
}) {
  const [productTags, setProductTags] = useState<string[]>(vendor?.products ?? []);
  const [inputValue, setInputValue] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const suggestions = inventoryProducts.filter(
    name => !productTags.includes(name) &&
      (inputValue === '' || name.toLowerCase().includes(inputValue.toLowerCase()))
  );

  const addTag = (tag: string) => {
    const t = tag.trim();
    if (t && !productTags.includes(t)) setProductTags(prev => [...prev, t]);
    setInputValue('');
    setDropdownOpen(false);
  };

  const removeTag = (tag: string) => setProductTags(prev => prev.filter(t => t !== tag));

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (inputValue.trim()) addTag(inputValue);
    } else if (e.key === 'Backspace' && inputValue === '' && productTags.length > 0) {
      setProductTags(prev => prev.slice(0, -1));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await onSave({
      name: fd.get('name') as string,
      email: fd.get('email') as string,
      phone: fd.get('phone') as string,
      country: fd.get('country') as string,
      products: productTags.length > 0 ? productTags : ['General'],
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
      {/* Name */}
      <div>
        <label className="form-label">Name</label>
        <input type="text" name="name" className="form-input" defaultValue={vendor?.name ?? ''} required />
      </div>

      {/* Email + Phone */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div>
          <label className="form-label">Email</label>
          <input type="email" name="email" className="form-input" defaultValue={vendor?.email ?? ''} required />
        </div>
        <div>
          <label className="form-label">Phone</label>
          <input type="text" name="phone" className="form-input" defaultValue={vendor?.phone ?? ''} required />
        </div>
      </div>

      {/* Country */}
      <div>
        <label className="form-label">Country</label>
        <select name="country" className="form-input" defaultValue={vendor?.country ?? ''} required>
          {countries.filter(c => c.status === 'active').map(c => (
            <option key={c.id} value={c.name}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Products Tag Input */}
      <div>
        <label className="form-label flex items-center gap-1.5">
          <Package size={13} className="text-slate-400" /> Products Supplied
        </label>

        {/* Tag box */}
        <div
          className="form-input min-h-[44px] flex flex-wrap gap-1.5 items-center cursor-text"
          onClick={() => (document.getElementById('vp-input') as HTMLInputElement)?.focus()}
        >
          {productTags.map(tag => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-2.5 py-0.5 text-xs font-medium"
            >
              {tag}
              <button
                type="button"
                onClick={e => { e.stopPropagation(); removeTag(tag); }}
                className="hover:text-red-500 transition-colors"
              >
                <X size={11} />
              </button>
            </span>
          ))}
          <input
            id="vp-input"
            type="text"
            value={inputValue}
            onChange={e => { setInputValue(e.target.value); setDropdownOpen(true); }}
            onKeyDown={handleKeyDown}
            onFocus={() => setDropdownOpen(true)}
            onBlur={() => setTimeout(() => setDropdownOpen(false), 150)}
            placeholder={productTags.length === 0 ? 'Type or pick a product...' : ''}
            className="flex-1 min-w-[130px] outline-none bg-transparent text-sm text-slate-700 placeholder:text-slate-400"
          />
        </div>

        {/* Dropdown */}
        {dropdownOpen && (suggestions.length > 0 || inputValue.trim()) && (
          <div className="mt-1 border border-slate-200 rounded-lg bg-white shadow-md max-h-40 overflow-y-auto z-50 relative">
            {suggestions.slice(0, 8).map(name => (
              <button
                key={name}
                type="button"
                onMouseDown={() => addTag(name)}
                className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2 transition-colors"
              >
                <Package size={12} className="text-slate-400 flex-shrink-0" /> {name}
              </button>
            ))}
            {inputValue.trim() && !productTags.includes(inputValue.trim()) && !suggestions.includes(inputValue.trim()) && (
              <button
                type="button"
                onMouseDown={() => addTag(inputValue)}
                className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 flex items-center gap-2 border-t border-slate-100 transition-colors"
              >
                <Plus size={12} /> Add &ldquo;<strong>{inputValue.trim()}</strong>&rdquo;
              </button>
            )}
          </div>
        )}
        <p className="text-xs text-slate-400 mt-1">
          Pick from inventory or type a name &amp; press Enter. Click × to remove a tag.
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-2 sm:gap-3 mt-4 sm:mt-6">
        <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
        <button type="submit" className="btn-primary flex-1 justify-center">{vendor ? 'Save Changes' : 'Add Vendor'}</button>
      </div>
    </form>
  );
}
