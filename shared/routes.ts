import { z } from 'zod';
import { 
  insertStudyNoteSchema, 
  insertHealthGoalSchema, 
  insertHealthLogSchema, 
  insertDailyActivitySchema,
  studyNotes,
  healthGoals,
  healthLogs,
  dailyActivities
} from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  studyNotes: {
    list: {
      method: 'GET' as const,
      path: '/api/study-notes',
      responses: {
        200: z.array(z.custom<typeof studyNotes.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/study-notes',
      input: insertStudyNoteSchema,
      responses: {
        201: z.custom<typeof studyNotes.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/study-notes/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  healthGoals: {
    list: {
      method: 'GET' as const,
      path: '/api/health-goals',
      responses: {
        200: z.array(z.custom<typeof healthGoals.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/health-goals',
      input: insertHealthGoalSchema,
      responses: {
        201: z.custom<typeof healthGoals.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  healthLogs: {
    list: {
      method: 'GET' as const,
      path: '/api/health-logs',
      input: z.object({
        date: z.string().optional(),
        goalId: z.coerce.number().optional()
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof healthLogs.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/health-logs',
      input: insertHealthLogSchema,
      responses: {
        201: z.custom<typeof healthLogs.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/health-logs/:id',
      input: insertHealthLogSchema.partial(),
      responses: {
        200: z.custom<typeof healthLogs.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  dailyActivities: {
    list: {
      method: 'GET' as const,
      path: '/api/daily-activities',
      input: z.object({ date: z.string().optional() }).optional(),
      responses: {
        200: z.array(z.custom<typeof dailyActivities.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/daily-activities',
      input: insertDailyActivitySchema,
      responses: {
        201: z.custom<typeof dailyActivities.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/daily-activities/:id',
      input: insertDailyActivitySchema.partial(),
      responses: {
        200: z.custom<typeof dailyActivities.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/daily-activities/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
