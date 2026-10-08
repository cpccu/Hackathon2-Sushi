import { z } from 'zod';

export const RESOURCE_CATEGORIES = [
  'Mid Question',
  'Final Question',
  'Class Test',
  'Class Notes',
  'Slides',
  'Assignment',
  'Lab',
  'Other',
] as const;

export const RESOURCE_SEMESTERS = ['Spring', 'Summer', 'Fall'] as const;

export const createResourceDocumentSchema = z.object({
  title: z.string().min(1, 'Document title is required').max(255),
  file_url: z.string().url('Invalid file URL'),
  file_type: z.string().max(50).optional(),
  file_size: z.number().int().nonnegative().optional(),
});

export const createResourceSchema = z.object({
  title: z.string().min(2, 'Resource title must be at least 2 characters').max(255),
  course_name: z.string().min(2, 'Course name must be at least 2 characters').max(255),
  course_code: z.string().max(50).optional().nullable(),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  year: z
    .number({ invalid_type_error: 'Year must be a number' })
    .int()
    .min(2010, 'Year must be 2010 or later')
    .max(new Date().getFullYear(), 'Year cannot exceed the current year'),
  semester: z.enum(RESOURCE_SEMESTERS, {
    errorMap: () => ({ message: 'Semester must be Spring, Summer, or Fall' }),
  }),
  department: z.string().min(1, 'Department is required').max(100),
  category: z.enum(RESOURCE_CATEGORIES, {
    errorMap: () => ({ message: 'Invalid resource category' }),
  }),
  optional_note: z.string().optional().nullable(),
  documents: z
    .array(createResourceDocumentSchema)
    .min(1, 'At least one document must be attached'),
});

export const voteResourceSchema = z.object({
  vote_type: z.union([z.literal(1), z.literal(-1)], {
    errorMap: () => ({ message: 'Vote must be 1 (upvote) or -1 (downvote)' }),
  }),
});

export const listResourcesQuerySchema = z.object({
  search: z.string().optional(),
  year: z.coerce.number().int().optional(),
  semester: z.string().optional(),
  department: z.string().optional(),
  category: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type CreateResourceInput = z.infer<typeof createResourceSchema>;
export type VoteResourceInput = z.infer<typeof voteResourceSchema>;
export type ListResourcesQuery = z.infer<typeof listResourcesQuerySchema>;
