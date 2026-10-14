/** Parse a request body with a zod schema, turning failures into a 400. */

import type { z } from 'zod';
import { badRequest } from './errors.ts';

export function parseBody<T extends z.ZodType>(schema: T, body: unknown): z.infer<T> {
  const result = schema.safeParse(body);
  if (result.success) return result.data;

  const details = result.error.issues.map((issue) => ({
    field: issue.path.join('.'),
    message: issue.message,
  }));
  const first = details[0];
  throw badRequest(
    first ? `${first.field || 'request'}: ${first.message}` : 'That request is not valid.',
    details,
  );
}
