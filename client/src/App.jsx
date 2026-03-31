import { useState, useEffect, useCallback } from 'react';
import {
  Package,
  Plus,
  Trash2,
  Search,
  ChevronUp,
  ChevronDown,
  X,
  Edit2,
  Check,
  AlertTriangle,
} from 'lucide-react';

const API = '/api';

const EMPTY_FORM = { name: '', category: '', price: '', quantity: '', sku: '', description: '' };

function Badge({ stock }) {
  if (stock === 0) return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-700">Out of stock</span>;
  if (stock < 10) return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-700">Low stock</span>;
  return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700">In stock</span>;
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

function ProductForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial || EMPTY_FORM);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await onSave(form);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const fields = [
    { name: 'name', label: 'Product Name', type: 'text', required: true, col: 2 },
    { name: 'sku', label: 'SKU', type: 'text', required: true, col: 1 },
    { name: 'category', label: 'Category', type: 'text', required: true, col: 1 },
    { name: 'price', label: 'Price ($)', type: 'number', required: true, min: 0, step: '0.01', col: 1 },
    { name: 'quantity', label: 'Quantity', type: 'number', required: true, min: 0, col: 1 },
    { name: 'description', label: 'Description', type: 'text', required: false, col: 2 },
  ];

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-2 gap-4">
        {fields.map(({ name, label, type, required, col, min, step }) => (
          <div key={name} className={col === 2 ? 'col-span-2' : ''}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <input
              name={name}
              type={type}
              required={required}
              min={min}
              step={step}
              value={form[name]}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            />
          </div>
        ))}
      </div>
      {error && (
        <div className="mt-3 flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
          <AlertTriangle size={14} /> {error}
        </div>
      )}
      <div className="flex justify-end gap-3 mt-6">
        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">Cancel</button>
        <button type="submit" disabled={saving} className="px-5 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors">
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </form>
  );
}

function QuantityCell({ product, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(product.quantity);
  const [saving, setSaving] = useState(false);

  const commit = async () => {
    const parsed = parseInt(value);
    if (isNaN(parsed) || parsed < 0) { setValue(product.quantity); setEditing(false); return; }
    if (parsed === product.quantity) { setEditing(false); return; }
    setSaving(true);
    await onUpdate(product.id, parsed);
    setSaving(false);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="flex items-center gap-1">
        <input
          autoFocus
          type="number"
          min="0"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { setValue(product.quantity); setEditing(false); } }}
          className="w-20 px-2 py-1 rounded border border-indigo-400 text-sm focus:outline-none"
        />
        <button onClick={commit} disabled={saving} className="p-1 rounded text-emerald-600 hover:bg-emerald-50"><Check size={14} /></button>
        <button onClick={() => { setValue(product.quantity); setEditing(false); }} className="p-1 rounded text-gray-400 hover:bg-gray-50"><X size={14} /></button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        <button onClick={() => onUpdate(product.id, Math.max(0, product.quantity - 1))} className="p-1 rounded hover:bg-gray-100 text-gray-500 transition-colors"><ChevronDown size={14} /></button>
        <span className="w-10 text-center font-medium text-sm">{product.quantity}</span>
        <button onClick={() => onUpdate(product.id, product.quantity + 1)} className="p-1 rounded hover:bg-gray-100 text-gray-500 transition-colors"><ChevronUp size={14} /></button>
      </div>
      <button onClick={() => setEditing(true)} className="p-1 rounded text-gray-300 hover:text-indigo-500 hover:bg-indigo-50 transition-colors"><Edit2 size={12} /></button>
    </div>
  );
}

export default function App() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showAdd, setShowAdd] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState('name');
  const [sortDir, setSortDir] = useState('asc');

  const fetchProducts = useCallback(async () => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (activeCategory !== 'All') params.set('category', activeCategory);
    const res = await fetch(`${API}/products?${params}`);
    const data = await res.json();
    setProducts(data);
    setLoading(false);
  }, [search, activeCategory]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  useEffect(() => {
    fetch(`${API}/categories`).then(r => r.json()).then(setCategories);
  }, []);

  const handleAddProduct = async (form) => {
    const res = await fetch(`${API}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, price: parseFloat(form.price), quantity: parseInt(form.quantity) }),
    });
    if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
    setShowAdd(false);
    fetchProducts();
    fetch(`${API}/categories`).then(r => r.json()).then(setCategories);
  };

  const handleEditProduct = async (form) => {
    const res = await fetch(`${API}/products/${editProduct.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, price: parseFloat(form.price), quantity: parseInt(form.quantity) }),
    });
    if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
    setEditProduct(null);
    fetchProducts();
    fetch(`${API}/categories`).then(r => r.json()).then(setCategories);
  };

  const handleUpdateQuantity = async (id, quantity) => {
    const res = await fetch(`${API}/products/${id}/quantity`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity }),
    });
    if (!res.ok) return;
    const updated = await res.json();
    setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
  };

  const handleDelete = async () => {
    await fetch(`${API}/products/${deleteTarget.id}`, { method: 'DELETE' });
    setDeleteTarget(null);
    fetchProducts();
    fetch(`${API}/categories`).then(r => r.json()).then(setCategories);
  };

  const sorted = [...products].sort((a, b) => {
    let va = a[sortField], vb = b[sortField];
    if (typeof va === 'string') { va = va.toLowerCase(); vb = vb.toLowerCase(); }
    if (va < vb) return sortDir === 'asc' ? -1 : 1;
    if (va > vb) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const toggleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <span className="opacity-0 group-hover:opacity-40 ml-1"><ChevronUp size={12} /></span>;
    return sortDir === 'asc' ? <ChevronUp size={12} className="ml-1 text-indigo-500" /> : <ChevronDown size={12} className="ml-1 text-indigo-500" />;
  };

  const totalValue = products.reduce((acc, p) => acc + p.price * p.quantity, 0);
  const lowStock = products.filter(p => p.quantity < 10).length;
  const outOfStock = products.filter(p => p.quantity === 0).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
              <Package size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">Inventory Manager</h1>
              <p className="text-xs text-gray-400">Retail Store</p>
            </div>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Plus size={16} /> Add Product
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Products', value: products.length, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { label: 'Inventory Value', value: `$${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Low Stock', value: lowStock, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Out of Stock', value: outOfStock, color: 'text-red-600', bg: 'bg-red-50' },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or SKU…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            {['All', ...categories].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeCategory === cat ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-left">
                  {[
                    { field: 'name', label: 'Product' },
                    { field: 'sku', label: 'SKU' },
                    { field: 'category', label: 'Category' },
                    { field: 'price', label: 'Price' },
                    { field: 'quantity', label: 'Quantity' },
                    { field: null, label: 'Status' },
                    { field: null, label: '' },
                  ].map(({ field, label }) => (
                    <th
                      key={label}
                      className={`px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider ${field ? 'cursor-pointer select-none group hover:text-gray-700' : ''}`}
                      onClick={field ? () => toggleSort(field) : undefined}
                    >
                      <div className="flex items-center">
                        {label}
                        {field && <SortIcon field={field} />}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr><td colSpan={7} className="py-20 text-center text-gray-400 text-sm">Loading…</td></tr>
                ) : sorted.length === 0 ? (
                  <tr><td colSpan={7} className="py-20 text-center text-gray-400 text-sm">No products found.</td></tr>
                ) : sorted.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{product.name}</p>
                        {product.description && <p className="text-xs text-gray-400 truncate max-w-48">{product.description}</p>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-gray-500">{product.sku}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-indigo-50 text-indigo-600">{product.category}</span>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-700">${product.price.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <QuantityCell product={product} onUpdate={handleUpdateQuantity} />
                    </td>
                    <td className="px-4 py-3"><Badge stock={product.quantity} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => setEditProduct(product)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          title="Edit product"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(product)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete product"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {sorted.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-50 text-xs text-gray-400">
              Showing {sorted.length} product{sorted.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </main>

      {/* Add Modal */}
      {showAdd && (
        <Modal title="Add New Product" onClose={() => setShowAdd(false)}>
          <ProductForm onSave={handleAddProduct} onClose={() => setShowAdd(false)} />
        </Modal>
      )}

      {/* Edit Modal */}
      {editProduct && (
        <Modal title="Edit Product" onClose={() => setEditProduct(null)}>
          <ProductForm
            initial={{ ...editProduct, price: String(editProduct.price), quantity: String(editProduct.quantity) }}
            onSave={handleEditProduct}
            onClose={() => setEditProduct(null)}
          />
        </Modal>
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <Modal title="Delete Product" onClose={() => setDeleteTarget(null)}>
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={22} className="text-red-600" />
            </div>
            <p className="text-gray-700 mb-1">Are you sure you want to delete</p>
            <p className="font-semibold text-gray-900 mb-4">"{deleteTarget.name}"?</p>
            <p className="text-sm text-gray-400 mb-6">This action cannot be undone.</p>
            <div className="flex justify-center gap-3">
              <button onClick={() => setDeleteTarget(null)} className="px-5 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">Cancel</button>
              <button onClick={handleDelete} className="px-5 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors">Delete</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
