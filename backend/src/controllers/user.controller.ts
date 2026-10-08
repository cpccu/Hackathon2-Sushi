import { Request, Response, NextFunction } from 'express';
import * as userService from '../services/user.service.js';
import { UnauthorizedError } from '../utils/errors.js';

export async function getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError();
    }
    const profile = await userService.getUserProfile(req.user.id);
    res.status(200).json({
      success: true,
      profile,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError();
    }
    const profile = await userService.updateUserProfile(req.user.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      profile,
    });
  } catch (err) {
    next(err);
  }
}
