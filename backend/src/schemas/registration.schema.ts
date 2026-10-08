import { z } from 'zod';

export const registerEventSchema = z.object({
  answers: z
    .array(
      z.object({
        question_id: z.string().uuid('Invalid question ID'),
        answer_text: z.string().min(1, 'Answer cannot be empty'),
      })
    )
    .default([]),
});

export type RegisterEventInput = z.infer<typeof registerEventSchema>;
