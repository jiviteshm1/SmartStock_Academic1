import React, { useState, useEffect } from 'react';
import { Receipt, Search, Filter, Printer, ExternalLink, RefreshCw, UserCheck } from 'lucide-react';
import { Sale } from '../types/index.ts';
import { api } from '../api.ts';

interface SalesHistoryProps {
  onViewInvoice: (sale: Sale) => void;
}

export const SalesHistory: React.FC<SalesHistoryProps> = ({ onViewInvoice }) => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('all');

  const fetchSales = async () => {
    try {
      setLoading(true);
      const res = await api.getSales({ search: searchQuery, limit: 100 });
      setSales(res.sales);
    } catch (err: any) {
      console.error('Failed to load sales:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchSales();
    }, 200);
    return () => clearTimeout(delay);
  }, [searchQuery]);

  const filteredSales = sales.filter((s) => {
    if (methodFilter !== 'all' && s.payment_method !== methodFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Audit Ledger
            </span>
            <span className="text-xs text-slate-400">{sales.length} transactions logged</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Sales &amp; Receipt Records
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Complete transaction history with cashier audit trails and printable student receipts.
          </p>
        </div>

        <button
          onClick={fetchSales}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search invoice number, student name, phone..."
            className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Payment:</span>
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Methods</option>
            <option value="cash">Cash Only</option>
            <option value="card">Credit / Debit Card</option>
            <option value="upi">UPI / QR</option>
          </select>
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Date &amp; Time</th>
                <th className="py-3 px-4">Customer / Student</th>
                <th className="py-3 px-4">Cashier</th>
                <th className="py-3 px-4 text-center">Payment</th>
                <th className="py-3 px-4 text-right">Items</th>
                <th className="py-3 px-4 text-right">Total Amount</th>
                <th className="py-3 px-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredSales.map((sale) => (
                <tr
                  key={sale.id}
                  className="hover:bg-slate-850/50 transition-colors cursor-pointer group"
                  onClick={() => onViewInvoice(sale)}
                >
                  <td className="py-3 px-4 font-mono font-bold text-emerald-400 group-hover:underline">
                    {sale.invoice_no}
                  </td>
                  <td className="py-3 px-4 text-slate-300 whitespace-nowrap">
                    {new Date(sale.created_at).toLocaleDateString()}{' '}
                    <span className="text-slate-500">
                      {new Date(sale.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-white font-medium">
                    <div>{sale.customer_name}</div>
                    {sale.customer_phone && (
                      <div className="text-[10px] text-slate-500 font-mono">
                        {sale.customer_phone}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <UserCheck className="w-3 h-3 text-slate-500" />
                      {sale.cashier_name || 'Staff'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono font-bold bg-slate-950 border border-slate-800 text-slate-300">
                      {sale.payment_method}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-300">
                    {sale.items?.length || '-'}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-extrabold text-emerald-400 text-sm">
                    ${Number(sale.total_amount).toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onViewInvoice(sale)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold flex items-center gap-1 ml-auto transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Print
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredSales.length === 0 && (
          <div className="py-12 text-center text-slate-500">
            <Receipt className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-xs font-semibold">No transactions match your search</p>
          </div>
        )}
      </div>
    </div>
  );
};
