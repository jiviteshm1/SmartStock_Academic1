import { Router, Response } from 'express';
import { db } from '../db.ts';
import { requireAuth, requireRole, AuthenticatedRequest } from '../middleware/auth.ts';

const router = Router();

// GET /api/reports/dashboard - Dashboard KPIs
router.get('/dashboard', requireAuth, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const kpis = await db.getDashboardKPIs();
    res.json(kpis);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/reports/analytics - Deep analytics and breakdown
router.get('/analytics', requireAuth, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const analytics = await db.getAnalytics();
    res.json(analytics);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/reports/export/csv - Export CSV file of sales
router.get('/export/csv', requireAuth, requireRole(['admin']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const type = req.query.type || 'sales';

    if (type === 'products') {
      const products = await db.getProducts();
      let csv = 'Product ID,Name,SKU,Barcode,Category,Cost Price,Selling Price,Stock Quantity,Min Stock Alert\n';
      for (const p of products) {
        csv += `"${p.id}","${p.name.replace(/"/g, '""')}","${p.sku}","${p.barcode}","${p.category_name || ''}",${p.cost_price.toFixed(2)},${p.selling_price.toFixed(2)},${p.stock_quantity},${p.min_stock_level}\n`;
      }
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="smartstock_products.csv"');
      res.send(csv);
      return;
    }

    const sales = await db.getSales({ limit: 1000 });
    let csv = 'Invoice No,Date,Cashier,Customer,Subtotal,Discount,Tax,Total,Payment Method,Status\n';
    for (const s of sales) {
      csv += `"${s.invoice_no}","${s.created_at}","${s.cashier_name || ''}","${s.customer_name}",${s.subtotal.toFixed(2)},${s.discount.toFixed(2)},${s.tax.toFixed(2)},${s.total_amount.toFixed(2)},"${s.payment_method}","${s.status}"\n`;
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="smartstock_sales_report.csv"');
    res.send(csv);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/system/status
router.get('/system/status', requireAuth, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const status = db.getEngineStatus();
    res.json(status);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/system/reset (admin only)
router.post('/system/reset', requireAuth, requireRole(['admin']), async (_req: AuthenticatedRequest, res: Response) => {
  try {
    db.resetToDefault();
    res.json({ message: 'Database reset to default seed dataset successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
