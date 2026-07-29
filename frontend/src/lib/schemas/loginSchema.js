import { z } from 'zod';

export const loginSchema = z.object({
   email: z
      .string()
      .trim()
      .min(1, 'Email is required.')
      .max(255, 'Email must not exceed 255 characters.')
      .email('Enter a valid email address.'),

   password: z.string().min(1, 'Password is required.').max(255, 'Password must not exceed 255 characters.'),
});
