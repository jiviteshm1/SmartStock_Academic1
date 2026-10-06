import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db.ts';
import { generateToken, requireAuth, requireRole, AuthenticatedRequest } from '../middleware/auth.ts';

const router = Router();

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ error: 'Username and password are required' });
      return;
    }

    const user = await db.findUserByUsername(username);
    if (!user) {
      res.status(401).json({ error: 'Invalid username or password' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid username or password' });
      return;
    }

    const payload = {
      id: user.id,
      username: user.username,
      role: user.role,
      full_name: user.full_name,
    };

    const token = generateToken(payload);

    res.json({
      message: 'Login successful',
      token,
      user: payload,
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: err.message || 'Internal server error during authentication' });
  }
});

// GET /api/auth/me
router.get('/me', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const user = await db.getUserById(req.user.id);
    if (!user) {
      res.status(404).json({ error: 'User account not found' });
      return;
    }

    res.json({ user });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/users (admin only)
router.get('/users', requireAuth, requireRole(['admin']), async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const users = await db.getUsers();
    res.json({ users });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
