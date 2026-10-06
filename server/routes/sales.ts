import { Router, Response } from 'express';
import { db } from '../db.ts';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.ts';
import { formatInvoiceHtml } from '../utils/invoice.ts';

const router = Router();

// POST /api/sales - Process POS transaction
router.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { items, customer_name, customer_phone, discount, payment_method, amount_paid } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: 'At least one item is required in the sale cart' });
      return;
    }

    if (!payment_method || !['cash', 'card', 'upi'].includes(payment_method)) {
      res.status(400).json({ error: 'Valid payment method is required: "cash", "card", or "upi"' });
      return;
    }

    const userId = req.user!.id;

    const sale = await db.createSale({
      items,
      customer_name,
      customer_phone,
      discount: discount ? parseFloat(discount) : 0,
      payment_method,
      amount_paid: amount_paid !== undefined ? parseFloat(amount_paid) : 0,
      user_id: userId,
    });

    res.status(201).json({
      message: 'Transaction completed successfully',
      sale,
    });
  } catch (err: any) {
    console.error('POS Sale Processing Error:', err);
    res.status(400).json({ error: err.message || 'Failed to process transaction' });
  }
});

// GET /api/sales - Sales history
router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const search = req.query.search ? String(req.query.search) : undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;

    const sales = await db.getSales({ search, limit });
    res.json({ sales, count: sales.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/sales/:invoiceNo - Single sale by invoice number
router.get('/:invoiceNo', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { invoiceNo } = req.params;
    const sale = await db.getSaleByInvoice(invoiceNo);

    if (!sale) {
      res.status(404).json({ error: `Invoice "${invoiceNo}" not found` });
      return;
    }

    res.json({ sale });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/sales/:invoiceNo/receipt - Thermal receipt HTML
router.get('/:invoiceNo/receipt', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { invoiceNo } = req.params;
    const sale = await db.getSaleByInvoice(invoiceNo);

    if (!sale) {
      res.status(404).send('<h3>Invoice not found</h3>');
      return;
    }

    const html = formatInvoiceHtml(sale);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (err: any) {
    res.status(500).send(`<h3>Error generating receipt: ${err.message}</h3>`);
  }
});

export default router;
