import React, { useState, useEffect } from 'react';
import {
  Download,
  CreditCard,
  Banknote,
  QrCode,
  Award,
  Layers,
  FileSpreadsheet,
} from 'lucide-react';
import { AnalyticsData, User } from '../types/index.ts';
import { api } from '../api.ts';
import { formatINR } from '../utils/format.ts';

interface ReportsProps {
  currentUser: User | null;
}

export const Reports: React.FC<ReportsProps> = ({ currentUser }) => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.getAnalytics();
      setData(res);
    } catch (err: any) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const totalCategoryRev = (data?.categoryBreakdown || []).reduce(
    (acc, curr) => acc + curr.revenue,
    0
  );

  const totalPaymentRev =
    (data?.paymentMethods?.cash?.total || 0) +
    (data?.paymentMethods?.card?.total || 0) +
    (data?.paymentMethods?.upi?.total || 0);

  const handleExport = (type: 'sales' | 'products') => {
    window.open(api.getExportCsvUrl(type), '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
              Business Intelligence
            </span>
            <span className="text-xs text-slate-400">Financial Reporting &amp; Analytics</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Store Performance Analytics
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Department revenue distribution, tender method shares, and fast-moving SKUs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport('sales')}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-950/40 transition-all active:scale-[0.98]"
          >
            <Download className="w-3.5 h-3.5" />
            Export Sales (CSV)
          </button>
          <button
            onClick={() => handleExport('products')}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Export Catalog
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Revenue Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              <h2 className="font-bold text-white text-sm">Revenue by Department</h2>
            </div>
            <span className="text-xs font-mono font-bold text-slate-300">
              Total: {formatINR(totalCategoryRev)}
            </span>
          </div>

          <div className="space-y-3.5 pt-2">
            {(data?.categoryBreakdown || []).map((cat, idx) => {
              const pct = totalCategoryRev > 0 ? (cat.revenue / totalCategoryRev) * 100 : 0;
              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-white">{cat.category}</span>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-slate-400">{cat.itemsSold} units</span>
                      <span className="font-bold text-purple-400">{formatINR(cat.revenue)}</span>
                      <span className="text-[11px] text-slate-500">({pct.toFixed(1)}%)</span>
                    </div>
                  </div>
                  <div className="w-full h-2 rounded bg-slate-950 overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 transition-all duration-300"
                      style={{ width: `${Math.max(4, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}

            {(!data?.categoryBreakdown || data.categoryBreakdown.length === 0) && (
              <p className="text-center py-6 text-xs text-slate-500">
                No categorical sales recorded yet.
              </p>
            )}
          </div>
        </div>

        {/* Payment Methods Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-indigo-400" />
              <h2 className="font-bold text-white text-sm">Tender / Payment Method Split</h2>
            </div>
            <span className="text-xs font-mono font-bold text-slate-300">
              {formatINR(totalPaymentRev)}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2">
            {/* Cash */}
            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-400 mb-2">
                  <Banknote className="w-4 h-4" />
                  Cash
                </div>
                <div className="text-base font-bold font-mono text-white">
                  {formatINR(data?.paymentMethods?.cash?.total || 0)}
                </div>
              </div>
              <div className="text-[11px] text-slate-400 mt-2 font-mono">
                {data?.paymentMethods?.cash?.count || 0} orders
              </div>
            </div>

            {/* Card */}
            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 mb-2">
                  <CreditCard className="w-4 h-4" />
                  Card
                </div>
                <div className="text-base font-bold font-mono text-white">
                  {formatINR(data?.paymentMethods?.card?.total || 0)}
                </div>
              </div>
              <div className="text-[11px] text-slate-400 mt-2 font-mono">
                {data?.paymentMethods?.card?.count || 0} orders
              </div>
            </div>

            {/* UPI */}
            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-violet-400 mb-2">
                  <QrCode className="w-4 h-4" />
                  UPI / QR
                </div>
                <div className="text-base font-bold font-mono text-white">
                  {formatINR(data?.paymentMethods?.upi?.total || 0)}
                </div>
              </div>
              <div className="text-[11px] text-slate-400 mt-2 font-mono">
                {data?.paymentMethods?.upi?.count || 0} orders
              </div>
            </div>
          </div>

          {/* Visual Percentage Bar */}
          {totalPaymentRev > 0 && (
            <div className="pt-2">
              <div className="text-[11px] text-slate-400 mb-1.5 flex justify-between">
                <span>Payment Share</span>
                <span className="font-mono">
                  Cash: {(((data?.paymentMethods?.cash?.total || 0) / totalPaymentRev) * 100).toFixed(0)}% · 
                  Card: {(((data?.paymentMethods?.card?.total || 0) / totalPaymentRev) * 100).toFixed(0)}% · 
                  UPI: {(((data?.paymentMethods?.upi?.total || 0) / totalPaymentRev) * 100).toFixed(0)}%
                </span>
              </div>
              <div className="h-2.5 rounded bg-slate-950 overflow-hidden flex border border-slate-800">
                <div
                  className="bg-purple-600 h-full"
                  style={{ width: `${((data?.paymentMethods?.cash?.total || 0) / totalPaymentRev) * 100}%` }}
                />
                <div
                  className="bg-indigo-600 h-full"
                  style={{ width: `${((data?.paymentMethods?.card?.total || 0) / totalPaymentRev) * 100}%` }}
                />
                <div
                  className="bg-violet-500 h-full"
                  style={{ width: `${((data?.paymentMethods?.upi?.total || 0) / totalPaymentRev) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Top 5 Best Selling Products Leaderboard */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            <h2 className="font-bold text-white text-sm">Top Fast-Moving Products Leaderboard</h2>
          </div>
          <span className="text-xs text-slate-400">Ranked by volume sold</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">SKU Code</th>
                <th className="py-3 px-4 text-center">Units Sold</th>
                <th className="py-3 px-4 text-right">Revenue Generated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {(data?.topSellingProducts || []).map((item, idx) => (
                <tr key={item.id} className="hover:bg-slate-850/50 transition-colors">
                  <td className="py-3 px-4 font-bold text-white">
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded text-xs font-mono ${
                        idx === 0
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          : idx === 1
                          ? 'bg-slate-300/20 text-slate-300 border border-slate-400/40'
                          : idx === 2
                          ? 'bg-amber-700/20 text-amber-500 border border-amber-700/40'
                          : 'bg-slate-950 text-slate-500'
                      }`}
                    >
                      #{idx + 1}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-white">{item.name}</td>
                  <td className="py-3 px-4 font-mono text-slate-400">{item.sku}</td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-white">
                    {item.unitsSold} units
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-purple-400">
                    {formatINR(item.totalRevenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {(!data?.topSellingProducts || data.topSellingProducts.length === 0) && (
            <p className="text-center py-8 text-xs text-slate-500">
              No sales transactions have occurred yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
