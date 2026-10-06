import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  Package,
  AlertTriangle,
  ShoppingCart,
  Receipt,
  RefreshCw,
  ArrowUpRight,
} from 'lucide-react';
import { DashboardKPIs, Sale } from '../types/index.ts';
import { api } from '../api.ts';
import { formatINR } from '../utils/format.ts';

interface DashboardProps {
  onNavigate: (tab: string) => void;
  onViewInvoice: (sale: Sale) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, onViewInvoice }) => {
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [loading, setLoading] = useState(true);
  const [restockModalItem, setRestockModalItem] = useState<{ id: number; name: string } | null>(null);
  const [restockQty, setRestockQty] = useState(10);
  const [restockLoading, setRestockLoading] = useState(false);

  const fetchKPIs = async () => {
    try {
      setLoading(true);
      const data = await api.getDashboardKPIs();
      setKpis(data);
    } catch (err) {
      console.error('Failed to load KPIs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKPIs();
  }, []);

  const handleQuickRestock = async () => {
    if (!restockModalItem) return;
    try {
      setRestockLoading(true);
      await api.restockProduct(restockModalItem.id, restockQty);
      setRestockModalItem(null);
      await fetchKPIs();
    } catch (err: any) {
      alert(`Restock failed: ${err.message}`);
    } finally {
      setRestockLoading(false);
    }
  };

  if (loading && !kpis) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-6 h-6 text-purple-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950/30 to-indigo-950/40 border border-purple-900/30 rounded-xl p-6 relative overflow-hidden shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                Academic Store Hub
              </span>
              <span className="text-xs text-slate-400">
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
              </span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Executive Store Overview
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Live transaction metrics, inventory stock levels, and daily campus sales ledger powered by transactional relational storage.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onNavigate('billing')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-950/50 transition-all active:scale-[0.98]"
            >
              <ShoppingCart className="w-4 h-4" />
              Open POS Terminal
            </button>
            <button
              onClick={fetchKPIs}
              className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Refresh Stats"
              aria-label="Refresh stats"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Sales */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Today's Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold font-mono text-sm border border-purple-500/20">
              ₹
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white tracking-tight font-mono">
              {formatINR(kpis?.todayRevenue ?? 0)}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-400">
              <span className="text-purple-400 font-semibold">{kpis?.todayOrdersCount ?? 0}</span>
              <span>orders completed today</span>
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Store Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white tracking-tight font-mono">
              {formatINR(kpis?.totalRevenue ?? 0)}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-400">
              <span className="text-indigo-400 font-semibold">{kpis?.totalOrdersCount ?? 0}</span>
              <span>lifetime store transactions</span>
            </div>
          </div>
        </div>

        {/* Total Stock Units */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Active Inventory</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white tracking-tight">
              {kpis?.totalStockUnits ?? 0}
              <span className="text-xs font-normal text-slate-400 ml-1.5">units</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-400">
              <span>Valuation:</span>
              <span className="font-semibold text-slate-200 font-mono">
                {formatINR(kpis?.inventoryValuation ?? 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Low Stock Warnings</span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              (kpis?.lowStockCount ?? 0) > 0 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-slate-800 text-slate-500'
            }`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>{kpis?.lowStockCount ?? 0}</span>
              {(kpis?.lowStockCount ?? 0) > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase">
                  Action Required
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-400">
              <span>{kpis?.totalProductsCount ?? 0} catalogued SKUs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Low Stock Alerts */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h2 className="font-bold text-white text-sm">Low Stock Items Under Threshold</h2>
            </div>
            <button
              onClick={() => onNavigate('products')}
              className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1"
            >
              Manage Inventory
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {kpis?.lowStockAlerts && kpis.lowStockAlerts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                    <th className="pb-3">Product Name</th>
                    <th className="pb-3">SKU</th>
                    <th className="pb-3 text-center">Current Stock</th>
                    <th className="pb-3 text-center">Min Threshold</th>
                    <th className="pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {kpis.lowStockAlerts.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-850/50 transition-colors">
                      <td className="py-3 font-semibold text-white">
                        <div>{item.name}</div>
                        <div className="text-[10px] text-slate-400">{item.category_name}</div>
                      </td>
                      <td className="py-3 font-mono text-slate-300">{item.sku}</td>
                      <td className="py-3 text-center">
                        <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-bold font-mono bg-rose-950/60 text-rose-400 border border-rose-800/50">
                          {item.stock_quantity} left
                        </span>
                      </td>
                      <td className="py-3 text-center text-slate-400 font-mono">
                        {item.min_stock_level}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => setRestockModalItem({ id: item.id, name: item.name })}
                          className="px-2.5 py-1 rounded-lg bg-purple-600/20 hover:bg-gradient-to-r hover:from-purple-600 hover:to-indigo-600 text-purple-300 hover:text-white border border-purple-500/30 text-[11px] font-bold transition-all"
                        >
                          Restock
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center rounded-xl bg-slate-950 border border-slate-800/80">
              <Package className="w-8 h-8 text-purple-400 mx-auto mb-2 opacity-80" />
              <p className="text-xs font-semibold text-slate-200">
                All inventory levels are healthy
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                No items are currently below their minimum reorder thresholds.
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Recent Transactions */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-purple-400" />
              <h2 className="font-bold text-white text-sm">Recent Transactions</h2>
            </div>
            <button
              onClick={() => onNavigate('sales')}
              className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1"
            >
              All Sales
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {kpis?.recentSales && kpis.recentSales.length > 0 ? (
            <div className="space-y-3">
              {kpis.recentSales.map((sale) => (
                <div
                  key={sale.id}
                  onClick={() => onViewInvoice(sale)}
                  className="p-3 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-bold text-purple-400 group-hover:underline">
                      {sale.invoice_no}
                    </span>
                    <span className="text-xs font-bold text-white font-mono">
                      {formatINR(sale.total_amount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="truncate max-w-[140px]">{sale.customer_name}</span>
                    <span className="uppercase text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
                      {sale.payment_method}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center rounded-xl bg-slate-950 border border-slate-800/80">
              <Receipt className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-400">No transactions recorded yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Restock Modal */}
      {restockModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-100">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl space-y-4">
            <div>
              <h3 className="font-bold text-white text-base">Quick Restock Units</h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                {restockModalItem.name}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Quantity to Add
              </label>
              <input
                type="number"
                min="1"
                value={restockQty}
                onChange={(e) => setRestockQty(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono text-sm focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRestockModalItem(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleQuickRestock}
                disabled={restockLoading}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition-colors shadow-sm"
              >
                {restockLoading ? 'Updating...' : `Add +${restockQty} Units`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
