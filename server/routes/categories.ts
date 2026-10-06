import { Router, Response } from 'express';
import { db } from '../db.ts';
import { requireAuth, requireRole, AuthenticatedRequest } from '../middleware/auth.ts';

const router = Router();

// GET /api/categories (accessible to authenticated users)
router.get('/', requireAuth, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const categories = await db.getCategories();
    res.json({ categories });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/categories (admin only)
router.post('/', requireAuth, requireRole(['admin']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, description } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) {
      res.status(400).json({ error: 'Category name is required' });
      return;
    }

    const created = await db.createCategory({ name, description: description || '' });
    res.status(201).json({ message: 'Category created successfully', category: created });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/categories/:id (admin only)
router.put('/:id', requireAuth, requireRole(['admin']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid category ID' });
      return;
    }

    const { name, description } = req.body;
    const updated = await db.updateCategory(id, { name, description });
    res.json({ message: 'Category updated successfully', category: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/categories/:id (admin only)
router.delete('/:id', requireAuth, requireRole(['admin']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid category ID' });
      return;
    }

    await db.deleteCategory(id);
    res.json({ message: 'Category deleted successfully' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
