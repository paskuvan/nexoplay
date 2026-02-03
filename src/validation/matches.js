import { z } from 'zod';

// Match status constant
export const MATCH_STATUS = {
  SCHEDULED: 'scheduled',
  LIVE: 'live',
  FINISHED: 'finished',
};

// List matches query schema
export const listMatchesQuerySchema = z.object({
  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(100)
    .optional(),
});

// Match ID param schema
export const matchIdParamSchema = z.object({
  id: z.coerce
    .number()
    .int()
    .positive(),
});

// Create match schema
export const createMatchSchema = z.object({
  sport: z
    .string()
    .min(1, 'Sport must not be empty'),
  homeTeam: z
    .string()
    .min(1, 'Home team must not be empty'),
  awayTeam: z
    .string()
    .min(1, 'Away team must not be empty'),
  startTime: z
    .string()
    .refine(
      (val) => {
        try {
          new Date(val);
          return !isNaN(Date.parse(val));
        } catch {
          return false;
        }
      },
      { message: 'startTime must be a valid ISO date string' }
    ),
  endTime: z
    .string()
    .refine(
      (val) => {
        try {
          new Date(val);
          return !isNaN(Date.parse(val));
        } catch {
          return false;
        }
      },
      { message: 'endTime must be a valid ISO date string' }
    )
    .optional(),
  homeScore: z.coerce
    .number()
    .int()
    .nonnegative()
    .optional(),
  awayScore: z.coerce
    .number()
    .int()
    .nonnegative()
    .optional(),
}).superRefine((data, ctx) => {
  if (data.endTime) {
    const startDate = new Date(data.startTime);
    const endDate = new Date(data.endTime);
    
    if (endDate <= startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['endTime'],
        message: 'endTime must be chronologically after startTime',
      });
    }
  }
});

// Update score schema
export const updateScoreSchema = z.object({
  homeScore: z.coerce
    .number()
    .int()
    .nonnegative(),
  awayScore: z.coerce
    .number()
    .int()
    .nonnegative(),
});
