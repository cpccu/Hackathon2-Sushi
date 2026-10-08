import { z } from 'zod';

export const COMPLAINT_CATEGORIES = [
  'academic',
  'facilities',
  'general',
  'transport',
  'hostel',
  'other',
] as const;

export type ComplaintCategory = (typeof COMPLAINT_CATEGORIES)[number];

export const createComplaintAttachmentSchema = z.object({
  title: z.string().min(1, 'Attachment title is required').max(255),
  file_url: z.string().url('Invalid file URL'),
  file_type: z.string().max(50).optional(),
  file_size: z.number().int().nonnegative().optional(),
});

export const createComplaintSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').max(255),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  category: z.enum(COMPLAINT_CATEGORIES, {
    errorMap: () => ({ message: 'Invalid category' }),
  }),
  attachments: z.array(createComplaintAttachmentSchema).max(10).default([]),
});

export const addResponseSchema = z.object({
  message: z.string().min(1, 'Response message cannot be empty').max(5000),
});

export const listComplaintsQuerySchema = z.object({
  search: z.string().optional(),
  category: z.enum(COMPLAINT_CATEGORIES).optional(),
  has_response: z.enum(['true', 'false']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateComplaintInput = z.infer<typeof createComplaintSchema>;
export type AddResponseInput = z.infer<typeof addResponseSchema>;
export type ListComplaintsQuery = z.infer<typeof listComplaintsQuerySchema>;
export type ComplaintAttachmentInput = z.infer<typeof createComplaintAttachmentSchema>;
