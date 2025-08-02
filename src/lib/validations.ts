import { z } from 'zod';
import { SwitchType, SoundProfile, Tactility } from '../types';

export const switchFilterSchema = z.object({
  search: z.string().optional(),
  brands: z.array(z.string()).optional(),
  types: z.array(z.nativeEnum(SwitchType)).optional(),
  minForce: z.number().min(0).max(200).optional(),
  maxForce: z.number().min(0).max(200).optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  soundProfiles: z.array(z.nativeEnum(SoundProfile)).optional(),
  tactility: z.array(z.nativeEnum(Tactility)).optional(),
  availability: z.boolean().optional(),
  sortBy: z.enum(['name', 'price', 'force', 'rating', 'newest']).optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
});

export type SwitchFilterInput = z.infer<typeof switchFilterSchema>;