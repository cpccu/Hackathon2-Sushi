import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../types/index.js';
import { ForbiddenError, UnauthorizedError } from '../utils/errors.js';

export const requireRole = (role: UserRole) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    if (req.user.role !== role) {
      return next(new ForbiddenError(`Access restricted to ${role}s only`));
    }

    next();
  };
};

export const requireClubAdmin = (req: Request, _res: Response, next: NextFunction): void => {
  if (!req.user) {
    return next(new UnauthorizedError('Authentication required'));
  }

  if (req.user.role !== 'club_admin' || !req.user.club_id) {
    return next(new ForbiddenError('Access restricted to authorized Club Admins only'));
  }

  next();
};
