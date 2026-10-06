import React from 'react';
import { X, Printer, CheckCircle2, Copy, Download } from 'lucide-react';
import { Sale } from '../types/index.ts';

interface InvoiceModalProps {
  sale: Sale | null;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ sale, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  if (!sale) return null;

  const handlePrint = () => {
    const printWindow = window.open(`/api/sales/${sale.invoice_no}/receipt`, '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  const handleCopyInvoiceNo = () => {
    navigator.clipboard.writeText(sale.invoice_no);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <h3 className="font-semibold text-white text-base">Receipt &amp; Invoice</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Receipt Paper Container */}
        <div className="p-6 overflow-y-auto bg-slate-950">
          <div className="bg-white text-slate-900 p-6 rounded-xl font-mono text-xs shadow-inner">
            {/* Header */}
            <div className="text-center border-b-2 border-dashed border-slate-400 pb-4 mb-4">
              <h2 className="text-base font-extrabold uppercase tracking-wider text-slate-950">
                SMARTSTOCK CAMPUS STORE
              </h2>
              <p className="text-[11px] text-slate-600 mt-0.5">
                University Academic Supplies &amp; Lab Depot
              </p>
              <p className="text-[10px] text-slate-500">Tax ID: ACA-8840-2026</p>
            </div>

            {/* Meta */}
            <div className="space-y-1 mb-4 text-[11px] text-slate-700">
              <div className="flex justify-between">
                <span>INVOICE:</span>
                <span className="font-bold text-slate-950">{sale.invoice_no}</span>
              </div>
              <div className="flex justify-between">
                <span>DATE:</span>
                <span>{new Date(sale.created_at).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>CUSTOMER:</span>
                <span className="font-semibold">{sale.customer_name}</span>
              </div>
              {sale.customer_phone && (
                <div className="flex justify-between">
                  <span>PHONE:</span>
                  <span>{sale.customer_phone}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>CASHIER:</span>
                <span>{sale.cashier_name || 'Staff'}</span>
              </div>
              <div className="flex justify-between">
                <span>PAYMENT:</span>
                <span className="uppercase font-bold text-slate-950">{sale.payment_method}</span>
              </div>
            </div>

            {/* Items Table */}
            <table className="w-full border-collapse mb-4 text-[11px]">
              <thead>
                <tr className="border-b border-slate-300 text-slate-600 uppercase text-[10px]">
                  <th className="text-left py-1">Description</th>
                  <th className="text-right py-1">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dashed divide-slate-200">
                {(sale.items || []).map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-2 pr-2">
                      <div className="font-bold text-slate-950">{item.product_name}</div>
                      <div className="text-[10px] text-slate-500">
                        {item.quantity} × ${Number(item.unit_price).toFixed(2)}
                      </div>
                    </td>
                    <td className="py-2 text-right font-bold align-top">
                      ${Number(item.subtotal).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Financial Summary */}
            <div className="space-y-1.5 pt-2 border-t border-dashed border-slate-400 text-[11px]">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${Number(sale.subtotal).toFixed(2)}</span>
              </div>
              {sale.discount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount:</span>
                  <span>-${Number(sale.discount).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Sales Tax (5%):</span>
                <span>${Number(sale.tax).toFixed(2)}</span>
              </div>

              <div className="flex justify-between py-2 border-y-2 border-dashed border-slate-950 text-sm font-extrabold text-slate-950">
                <span>TOTAL DUE:</span>
                <span>${Number(sale.total_amount).toFixed(2)}</span>
              </div>

              <div className="flex justify-between pt-1">
                <span>Amount Tendered:</span>
                <span>${Number(sale.amount_paid).toFixed(2)}</span>
              </div>
              {sale.change_returned > 0 && (
                <div className="flex justify-between font-bold text-slate-950">
                  <span>Change Returned:</span>
                  <span>${Number(sale.change_returned).toFixed(2)}</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="text-center text-[10px] text-slate-500 mt-6 pt-3 border-t border-slate-200 leading-relaxed">
              <p>Thank you for shopping at SmartStock Academic!</p>
              <p>Returns accepted within 14 days with original receipt.</p>
            </div>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={handleCopyInvoiceNo}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
            {copied ? 'Copied!' : 'Copy Invoice #'}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
            >
              Done
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-950 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Receipt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
