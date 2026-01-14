import { vi } from 'vitest';

export const mockAuthMiddleware = {
  authMiddleware: (req: any, res: any, next: any) => {
    req.user = { isAdmin: true, userId: 1, username: 'admin' };
    next();
  },
  adminMiddleware: (req: any, res: any, next: any) => {
    next(); 
  }
};

export const mockDb = {
  default: {
    query: vi.fn(),
  }
};
