import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env.js';
import * as authService from '../services/auth.service.js';

const cookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: env.SESSION_MAX_AGE_DAYS * 24 * 60 * 60 * 1000,
  path: '/',
};

export async function signup(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { user, token } = await authService.registerStudent(req.body);
    res.cookie(env.COOKIE_NAME, token, cookieOptions);
    res.status(201).json({
      success: true,
      message: 'Signup successful',
      user,
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { user, token } = await authService.loginUser(req.body);
    res.cookie(env.COOKIE_NAME, token, cookieOptions);
    res.status(200).json({
      success: true,
      message: 'Login successful',
      user,
    });
  } catch (err) {
    next(err);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = req.cookies[env.COOKIE_NAME];
    if (token) {
      await authService.destroySession(token);
    }
    res.clearCookie(env.COOKIE_NAME, { path: '/' });
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (err) {
    next(err);
  }
}

export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    res.status(200).json({
      success: true,
      user: req.user || null,
    });
  } catch (err) {
    next(err);
  }
}
