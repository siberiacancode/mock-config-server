import { z } from 'zod';

// ✅ important:
// port can only be a number from 0 to 65535
export const portSchema = z.number().int().nonnegative().max(65535);
