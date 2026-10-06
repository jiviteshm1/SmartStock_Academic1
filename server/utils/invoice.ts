import { Sale } from '../db.ts';

export function formatInvoiceHtml(sale: Sale): string {
  const itemsHtml = (sale.items || [])
    .map(
      (item) => `
      <tr>
        <td style="padding: 6px 0; border-bottom: 1px dashed #e2e8f0; font-size: 13px;">
          <div style="font-weight: 600; color: #0f172a;">${item.product_name}</div>
          <div style="font-size: 11px; color: #64748b;">SKU: ${item.sku || 'N/A'} · ${item.quantity} × $${item.unit_price.toFixed(2)}</div>
        </td>
        <td style="padding: 6px 0; border-bottom: 1px dashed #e2e8f0; text-align: right; font-weight: 600; color: #0f172a; font-size: 13px;">
          $${item.subtotal.toFixed(2)}
        </td>
      </tr>
    `
    )
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Receipt - ${sale.invoice_no}</title>
  <style>
    body {
      font-family: 'JetBrains Mono', 'Courier New', monospace;
      margin: 0;
      padding: 24px;
      color: #1e293b;
      background: #ffffff;
      max-width: 380px;
      margin: 0 auto;
    }
    .header { text-align: center; border-bottom: 2px dashed #94a3b8; padding-bottom: 16px; margin-bottom: 16px; }
    .store-name { font-size: 18px; font-weight: 800; letter-spacing: 0.5px; margin: 0; text-transform: uppercase; }
    .store-subtitle { font-size: 12px; color: #64748b; margin-top: 4px; }
    .meta-row { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    .summary-row { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 4px; }
    .total-row { display: flex; justify-content: space-between; font-size: 16px; font-weight: 800; border-top: 2px dashed #0f172a; border-bottom: 2px dashed #0f172a; padding: 8px 0; margin: 8px 0; }
    .footer { text-align: center; font-size: 11px; color: #64748b; margin-top: 20px; line-height: 1.4; }
    @media print {
      body { padding: 0; max-width: 100%; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="store-name">SMARTSTOCK CAMPUS STORE</div>
    <div class="store-subtitle">University Academic Supplies & Lab Depot</div>
    <div class="store-subtitle">Tax Reg # ACA-8840-2026</div>
  </div>

  <div class="meta-row"><span>INVOICE:</span><strong>${sale.invoice_no}</strong></div>
  <div class="meta-row"><span>DATE:</span><span>${new Date(sale.created_at).toLocaleString()}</span></div>
  <div class="meta-row"><span>CUSTOMER:</span><span>${sale.customer_name}</span></div>
  ${sale.customer_phone ? `<div class="meta-row"><span>PHONE:</span><span>${sale.customer_phone}</span></div>` : ''}
  <div class="meta-row"><span>CASHIER:</span><span>${sale.cashier_name || 'Staff'}</span></div>
  <div class="meta-row"><span>PAYMENT:</span><span style="text-transform: uppercase; font-weight: bold;">${sale.payment_method}</span></div>

  <table>
    <thead>
      <tr style="border-bottom: 1px solid #cbd5e1; font-size: 11px; text-transform: uppercase; color: #64748b;">
        <th style="text-align: left; padding-bottom: 4px;">Item Description</th>
        <th style="text-align: right; padding-bottom: 4px;">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${itemsHtml}
    </tbody>
  </table>

  <div class="summary-row"><span>Subtotal:</span><span>$${sale.subtotal.toFixed(2)}</span></div>
  ${sale.discount > 0 ? `<div class="summary-row" style="color: #16a34a;"><span>Discount:</span><span>-$${sale.discount.toFixed(2)}</span></div>` : ''}
  <div class="summary-row"><span>Sales Tax (5%):</span><span>$${sale.tax.toFixed(2)}</span></div>
  
  <div class="total-row">
    <span>TOTAL DUE:</span>
    <span>$${sale.total_amount.toFixed(2)}</span>
  </div>

  <div class="summary-row"><span>Amount Tendered:</span><span>$${sale.amount_paid.toFixed(2)}</span></div>
  ${sale.change_returned > 0 ? `<div class="summary-row" style="font-weight: 700;"><span>Change Returned:</span><span>$${sale.change_returned.toFixed(2)}</span></div>` : ''}

  <div class="footer">
    <p>Thank you for shopping at SmartStock Academic!<br/>
    Returns accepted within 14 days with original receipt.<br/>
    Retain for course fee reimbursement & warranties.</p>
  </div>
</body>
</html>
  `;
}
