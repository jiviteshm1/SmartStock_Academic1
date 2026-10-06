import React, { useState, useEffect } from 'react';
import {
  Boxes,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  AlertTriangle,
  RotateCcw,
  Check,
  X,
  PackagePlus,
  DollarSign,
  Tag,
} from 'lucide-react';
import { Product, Category, User } from '../types/index.ts';
import { api } from '../api.ts';

interface ProductsProps {
  currentUser: User | null;
}

export const Products: React.FC<ProductsProps> = ({ currentUser }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState<number | null>(null);
  const [lowStockOnly, setLowStockOnly] = useState(false);

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [restockProduct, setRestockProduct] = useState<Product | null>(null);
  const [restockQty, setRestockQty] = useState(10);
  const [formLoading, setFormLoading] = useState(false);
  const [actionError, setActionError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    barcode: '',
    category_id: 1,
    cost_price: 10,
    selling_price: 15,
    stock_quantity: 20,
    min_stock_level: 5,
    image_url: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400&auto=format&fit=crop&q=80',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        api.getProducts(),
        api.getCategories(),
      ]);
      setProducts(prodRes.products);
      setCategories(catRes.categories);
      if (catRes.categories.length > 0) {
        setFormData((prev) => ({ ...prev, category_id: catRes.categories[0].id }));
      }
    } catch (err: any) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCat === null || p.category_id === selectedCat;
    const matchesLow = !lowStockOnly || p.stock_quantity <= p.min_stock_level;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.barcode.toLowerCase().includes(q) ||
      (p.category_name && p.category_name.toLowerCase().includes(q));

    return matchesCat && matchesLow && matchesSearch;
  });

  // Open Edit Modal
  const handleOpenEdit = (p: Product) => {
    setEditProduct(p);
    setFormData({
      name: p.name,
      sku: p.sku,
      barcode: p.barcode,
      category_id: p.category_id,
      cost_price: p.cost_price,
      selling_price: p.selling_price,
      stock_quantity: p.stock_quantity,
      min_stock_level: p.min_stock_level,
      image_url: p.image_url,
    });
  };

  // Submit Add
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError('');
    setFormLoading(true);

    try {
      await api.createProduct(formData);
      setIsAddOpen(false);
      await fetchData();
    } catch (err: any) {
      setActionError(err.message || 'Failed to create product');
    } finally {
      setFormLoading(false);
    }
  };

  // Submit Edit
  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProduct) return;
    setActionError('');
    setFormLoading(true);

    try {
      await api.updateProduct(editProduct.id, formData);
      setEditProduct(null);
      await fetchData();
    } catch (err: any) {
      setActionError(err.message || 'Failed to update product');
    } finally {
      setFormLoading(false);
    }
  };

  // Submit Restock
  const handleRestock = async () => {
    if (!restockProduct) return;
    try {
      setFormLoading(true);
      await api.restockProduct(restockProduct.id, restockQty);
      setRestockProduct(null);
      await fetchData();
    } catch (err: any) {
      alert(`Restock failed: ${err.message}`);
    } finally {
      setFormLoading(false);
    }
  };

  // Delete
  const handleDeleteProduct = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to delete product "${name}"?`)) return;

    try {
      await api.deleteProduct(id);
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Cannot delete product');
    }
  };

  const isAdmin = currentUser?.role === 'admin';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Inventory Master
            </span>
            <span className="text-xs text-slate-400">{products.length} registered SKUs</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Campus Inventory Catalog
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time stock valuation, reorder thresholds, and SKU/barcode mapping.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin ? (
            <button
              onClick={() => setIsAddOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950 transition-all active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              Add New Product
            </button>
          ) : (
            <span
              title="Admin role required to add products"
              className="px-3 py-2 rounded-xl bg-slate-800 text-slate-500 text-xs font-medium cursor-not-allowed"
            >
              Add Product (Admin Only)
            </span>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2 w-full md:w-auto">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by SKU, Name, Barcode..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Category Dropdown */}
          <select
            value={selectedCat || ''}
            onChange={(e) => setSelectedCat(e.target.value ? Number(e.target.value) : null)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Low Stock Toggle */}
        <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer self-start md:self-auto select-none">
          <input
            type="checkbox"
            checked={lowStockOnly}
            onChange={(e) => setLowStockOnly(e.target.checked)}
            className="w-4 h-4 rounded text-emerald-600 focus:ring-0 bg-slate-950 border-slate-800"
          />
          <span className="flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            Low Stock Alerts Only
          </span>
        </label>
      </div>

      {/* Products Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Item Details</th>
                <th className="py-3 px-4">SKU / Barcode</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Cost Price</th>
                <th className="py-3 px-4 text-right">Retail Price</th>
                <th className="py-3 px-4 text-center">Margin %</th>
                <th className="py-3 px-4 text-center">Stock Level</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredProducts.map((p) => {
                const margin =
                  p.selling_price > 0
                    ? Math.round(((p.selling_price - p.cost_price) / p.selling_price) * 100)
                    : 0;
                const isOut = p.stock_quantity <= 0;
                const isLow = p.stock_quantity <= p.min_stock_level && !isOut;

                return (
                  <tr key={p.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.image_url}
                          alt={p.name}
                          className="w-10 h-10 rounded-lg object-cover bg-slate-950 border border-slate-800 flex-shrink-0"
                          loading="lazy"
                        />
                        <div className="min-w-0">
                          <div className="font-bold text-white text-xs truncate max-w-[200px]">
                            {p.name}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">ID #{p.id}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono">
                      <div className="text-white font-semibold">{p.sku}</div>
                      <div className="text-[10px] text-slate-500">{p.barcode}</div>
                    </td>

                    <td className="py-3 px-4 text-slate-300">
                      <span className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-[11px]">
                        {p.category_name}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right font-mono text-slate-400">
                      ${p.cost_price.toFixed(2)}
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                      ${p.selling_price.toFixed(2)}
                    </td>

                    <td className="py-3 px-4 text-center font-mono">
                      <span
                        className={`text-[11px] font-bold ${
                          margin >= 30 ? 'text-emerald-400' : 'text-slate-400'
                        }`}
                      >
                        {margin}%
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center font-mono">
                      {isOut ? (
                        <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-400 border border-rose-800">
                          0 (Out of Stock)
                        </span>
                      ) : isLow ? (
                        <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-400 border border-amber-800">
                          {p.stock_quantity} (Low &le; {p.min_stock_level})
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                          {p.stock_quantity} Units
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setRestockProduct(p)}
                          className="px-2 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/30 text-[10px] font-bold transition-all"
                          title="Quick Restock Units"
                        >
                          Restock
                        </button>

                        {isAdmin && (
                          <>
                            <button
                              onClick={() => handleOpenEdit(p)}
                              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                              title="Edit Product"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id, p.name)}
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                              title="Delete Product"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="py-12 text-center text-slate-500">
            <Boxes className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-xs font-semibold">No products found</p>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {(isAddOpen || editProduct) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-100">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">
                {isAddOpen ? 'Add New Product SKU' : `Edit Product: ${editProduct?.name}`}
              </h3>
              <button
                onClick={() => {
                  setIsAddOpen(false);
                  setEditProduct(null);
                }}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {actionError && (
              <div className="p-2.5 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs">
                {actionError}
              </div>
            )}

            <form
              onSubmit={isAddOpen ? handleCreateProduct : handleUpdateProduct}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Modern Physics Lab Manual"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">SKU Code</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                    placeholder="e.g. PH-LAB-01"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Barcode</label>
                  <input
                    type="text"
                    required
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    placeholder="e.g. 8901009999"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={formData.category_id}
                    onChange={(e) =>
                      setFormData({ ...formData, category_id: parseInt(e.target.value, 10) })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Image URL</label>
                  <input
                    type="text"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Cost Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.cost_price}
                    onChange={(e) =>
                      setFormData({ ...formData, cost_price: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Retail Selling Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.selling_price}
                    onChange={(e) =>
                      setFormData({ ...formData, selling_price: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Opening Stock</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.stock_quantity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        stock_quantity: parseInt(e.target.value, 10) || 0,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Min Stock Threshold
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.min_stock_level}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        min_stock_level: parseInt(e.target.value, 10) || 5,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddOpen(false);
                    setEditProduct(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors"
                >
                  {formLoading ? 'Saving...' : isAddOpen ? 'Create Product' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Restock Modal */}
      {restockProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-100">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div>
              <h3 className="font-bold text-white text-base">Restock Units</h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                {restockProduct.name} (Currently {restockProduct.stock_quantity} units)
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Quantity to Add to Current Stock
              </label>
              <input
                type="number"
                min="1"
                value={restockQty}
                onChange={(e) => setRestockQty(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRestockProduct(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRestock}
                disabled={formLoading}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
              >
                {formLoading ? 'Adding...' : `Add +${restockQty} Units`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
