import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'smartstock_academic_jwt_secret_key_2026';

export interface AuthUserPayload {
  id: number;
  username: string;
  role: 'admin' | 'cashier';
  full_name: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUserPayload;
}

export function generateToken(user: AuthUserPayload): string {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role,
      full_name: user.full_name,
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ error: 'Authentication required. Missing Authorization header.' });
    return;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    res.status(401).json({ error: 'Malformed token. Format must be "Bearer <token>"' });
    return;
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUserPayload;
    req.user = decoded;
    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      res.status(401).json({ error: 'Session expired. Please log in again.' });
      return;
    }
    res.status(401).json({ error: 'Invalid authentication token.' });
  }
}

export function requireRole(allowedRoles: ('admin' | 'cashier')[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'User not authenticated.' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: `Access denied. Role "${req.user.role}" does not have sufficient permissions for this operation.`,
      });
      return;
    }

    next();
  };
}
