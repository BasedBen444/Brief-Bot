import { z } from 'zod';

export const briefRequestSchema = z.object({
  event: z.object({
    title: z.string().min(1, 'Event title is required'),
    datetime: z.string().refine((value) => !Number.isNaN(new Date(value).getTime()), {
      message: 'datetime must be a valid ISO-8601 string',
    }),
    attendees: z.array(z.string()).default([]),
    audience: z.enum(['exec', 'ic', 'mixed']).default('mixed'),
    description: z.string().optional(),
  }),
  materials: z
    .array(
      z.object({
        title: z.string().min(1, 'Material title is required'),
        url: z.string().url('Material URL must be valid'),
        content: z.string().min(1, 'Provide a short summary of the material'),
        lastModified: z.string().optional(),
        isLatestVersion: z.boolean().optional(),
      }),
    )
    .optional(),
});

export type BriefRequestInput = z.infer<typeof briefRequestSchema>;
