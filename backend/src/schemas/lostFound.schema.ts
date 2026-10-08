import { z } from 'zod';

export const POST_TYPES = ['lost', 'found'] as const;
export const POST_STATUSES = ['active', 'resolved'] as const;

// ─── Create Post ─────────────────────────────────────────────────────────────
export const createLostFoundSchema = z.object({
  post_type: z.enum(POST_TYPES, {
    errorMap: () => ({ message: "Post type must be 'lost' or 'found'" }),
  }),
  item_name: z
    .string()
    .min(2, 'Item name must be at least 2 characters')
    .max(255),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters'),
  keywords: z.array(z.string().max(50)).max(20).default([]),
  location: z
    .string()
    .min(2, 'Location must be at least 2 characters')
    .max(255),
  incident_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  contact_phone: z.string().max(50).optional().nullable(),
  contact_email: z.string().email('Please enter a valid email address').max(255).optional().nullable(),
  // images: array of 1-3 Cloudinary URLs already uploaded via /upload-image
  images: z
    .array(z.string().url('Each image must be a valid URL'))
    .min(1, 'At least 1 image is required')
    .max(3, 'Maximum 3 images allowed'),
});

// ─── Update Post ─────────────────────────────────────────────────────────────
export const updateLostFoundSchema = z.object({
  item_name: z.string().min(2).max(255).optional(),
  description: z.string().min(10).optional(),
  keywords: z.array(z.string().max(50)).max(20).optional(),
  location: z.string().min(2).max(255).optional(),
  incident_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .optional(),
  contact_phone: z.string().max(50).optional().nullable(),
  contact_email: z.string().email('Please enter a valid email address').max(255).optional().nullable(),
  images: z
    .array(z.string().url('Each image must be a valid URL'))
    .min(1, 'At least 1 image is required')
    .max(3, 'Maximum 3 images allowed')
    .optional(),
});

// ─── Resolve Status ───────────────────────────────────────────────────────────
export const updateStatusSchema = z.object({
  status: z.literal('resolved', {
    errorMap: () => ({ message: "Status can only be set to 'resolved'" }),
  }),
});

// ─── List / Browse Query ─────────────────────────────────────────────────────
export const listLostFoundQuerySchema = z.object({
  search: z.string().optional(),
  q: z.string().optional(),
  post_type: z.enum(['lost', 'found']).optional(),
  status: z.enum(['active', 'resolved']).optional(),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

// ─── Inferred Types ───────────────────────────────────────────────────────────
export type CreateLostFoundInput = z.infer<typeof createLostFoundSchema>;
export type UpdateLostFoundInput = z.infer<typeof updateLostFoundSchema>;
export type ListLostFoundQuery = z.infer<typeof listLostFoundQuerySchema>;
