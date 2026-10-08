import { z } from 'zod';

export const HELPDESK_POST_TYPES = ['academic', 'facilities'] as const;

export const createHelpdeskAttachmentSchema = z.object({
  title: z.string().min(1, 'Attachment title is required').max(255),
  file_url: z.string().url('Invalid file URL'),
  file_type: z.string().max(50).optional(),
  file_size: z.number().int().nonnegative().optional(),
});

export const createHelpdeskPostSchema = z.object({
  post_type: z.enum(HELPDESK_POST_TYPES, {
    errorMap: () => ({ message: "Type must be either 'academic' or 'facilities'" }),
  }),
  title: z.string().min(2, 'Title must be at least 2 characters').max(255),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  keywords: z.array(z.string().max(50)).max(20).default([]),
  steps: z.array(z.string().min(1, 'Step content cannot be empty')).max(30).default([]),
  attachments: z.array(createHelpdeskAttachmentSchema).max(10).default([]),
});

export const updateHelpdeskPostSchema = z.object({
  post_type: z.enum(HELPDESK_POST_TYPES).optional(),
  title: z.string().min(2).max(255).optional(),
  description: z.string().min(5).optional(),
  keywords: z.array(z.string().max(50)).max(20).optional(),
  steps: z.array(z.string().min(1)).max(30).optional(),
  attachments: z.array(createHelpdeskAttachmentSchema).max(10).optional(),
});

export const listHelpdeskQuerySchema = z.object({
  search: z.string().optional(),
  q: z.string().optional(),
  post_type: z.enum(HELPDESK_POST_TYPES).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export type CreateHelpdeskPostInput = z.infer<typeof createHelpdeskPostSchema>;
export type UpdateHelpdeskPostInput = z.infer<typeof updateHelpdeskPostSchema>;
export type ListHelpdeskQuery = z.infer<typeof listHelpdeskQuerySchema>;
export type HelpdeskAttachmentInput = z.infer<typeof createHelpdeskAttachmentSchema>;
