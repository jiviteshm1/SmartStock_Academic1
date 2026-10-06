import { Router, Response } from 'express';
import { db } from '../db.ts';
import { requireAuth, requireRole, AuthenticatedRequest } from '../middleware/auth.ts';

const router = Router();

// GET /api/products
router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const category_id = req.query.category_id ? parseInt(req.query.category_id as string, 10) : undefined;
    const search = req.query.search ? String(req.query.search) : undefined;
    const low_stock = req.query.low_stock === 'true';

    const products = await db.getProducts({ category_id, search, low_stock });
    res.json({ products, total: products.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/products/:id
router.get('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid product ID' });
      return;
    }

    const product = await db.getProductById(id);
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    res.json({ product });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/products (admin only)
router.post('/', requireAuth, requireRole(['admin']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, sku, barcode, category_id, cost_price, selling_price, stock_quantity, min_stock_level, image_url } = req.body;

    if (!name || !sku || !barcode || !category_id || selling_price === undefined) {
      res.status(400).json({ error: 'Missing required product fields: name, sku, barcode, category_id, selling_price' });
      return;
    }

    const product = await db.createProduct({
      name,
      sku,
      barcode,
      category_id: parseInt(category_id, 10),
      cost_price: parseFloat(cost_price) || 0,
      selling_price: parseFloat(selling_price),
      stock_quantity: parseInt(stock_quantity, 10) || 0,
      min_stock_level: parseInt(min_stock_level, 10) || 5,
      image_url,
    });

    res.status(201).json({ message: 'Product created successfully', product });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/products/:id (admin only)
router.put('/:id', requireAuth, requireRole(['admin']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid product ID' });
      return;
    }

    const updated = await db.updateProduct(id, req.body);
    res.json({ message: 'Product updated successfully', product: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/products/:id/restock (admin or cashier quick restock)
router.post('/:id/restock', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { quantity } = req.body;
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid product ID' });
      return;
    }

    const restocked = await db.restockProduct(id, quantity);
    res.json({ message: `Successfully added ${quantity} units to stock`, product: restocked });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/products/:id (admin only)
router.delete('/:id', requireAuth, requireRole(['admin']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid product ID' });
      return;
    }

    await db.deleteProduct(id);
    res.json({ message: 'Product deleted successfully' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
