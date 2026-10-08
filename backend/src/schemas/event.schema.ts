import { z } from 'zod';

export const listEventsQuerySchema = z.object({
  search: z.string().optional(),
  clubId: z.string().uuid().optional(),
  department: z.string().optional(),
  category: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date format must be YYYY-MM-DD').optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
});

export const questionItemSchema = z.object({
  question_text: z.string().min(1, 'Question text is required'),
  is_required: z.boolean().default(false),
});

export const createEventSchema = z.object({
  name: z.string().min(2, 'Event name is required').max(255),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.string().min(1, 'Category is required'),
  venue: z.string().min(1, 'Venue is required'),
  event_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Event date must be YYYY-MM-DD'),
  start_time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, 'Start time must be HH:mm or HH:mm:ss'),
  duration_minutes: z.coerce.number().int().positive('Duration must be greater than 0'),
  registration_start: z.string().datetime({ offset: true }).or(z.string().min(10)),
  registration_deadline: z.string().datetime({ offset: true }).or(z.string().min(10)),
  allowed_departments: z.union([z.array(z.string()), z.string()]).transform((val) => {
    if (Array.isArray(val)) return val.filter(Boolean);
    if (!val) return [];
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed.filter(Boolean);
    } catch {
      return val.split(',').map((s) => s.trim()).filter(Boolean);
    }
    return [];
  }).default([]),
  allowed_batches: z.union([z.array(z.string()), z.string()]).transform((val) => {
    if (Array.isArray(val)) return val.filter(Boolean);
    if (!val) return [];
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed.filter(Boolean);
    } catch {
      return val.split(',').map((s) => s.trim()).filter(Boolean);
    }
    return [];
  }).default([]),
  contact_email: z.string().email('Contact email must be a valid email'),
  questions: z.union([z.array(questionItemSchema), z.string()]).transform((val) => {
    if (Array.isArray(val)) return val;
    if (!val) return [];
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return [];
    }
    return [];
  }).default([]),
});

export const updateEventSchema = z.object({
  name: z.string().min(2, 'Event name is required').max(255).optional(),
  description: z.string().min(10, 'Description must be at least 10 characters').optional(),
  event_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Event date must be YYYY-MM-DD').optional(),
  start_time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, 'Start time must be HH:mm or HH:mm:ss').optional(),
  duration_minutes: z.coerce.number().int().positive('Duration must be greater than 0').optional(),
});

export type ListEventsQuery = z.infer<typeof listEventsQuerySchema>;
export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
