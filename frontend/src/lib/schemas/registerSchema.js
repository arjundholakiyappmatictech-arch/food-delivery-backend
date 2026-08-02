import { z } from 'zod';

export const registerSchema = z.object({
   full_name: z
      .string()
      .trim()
      .min(1, 'Full name is required.')
      .max(255, 'Full name must not exceed 255 characters.')
      .regex(/^[A-Za-z\s]+$/, 'Only letters and spaces are allowed.')
      .refine((value) => value.trim().split(/\s+/).length >= 2, {
         message: 'Please enter both first name and last name.',
      }),

   email: z
      .string()
      .trim()
      .min(1, 'Email is required.')
      .max(255, 'Email must not exceed 255 characters.')
      .email('Enter a valid email address.'),

   phone_number: z
      .string()
      .trim()
      .min(1, 'Phone number is required.')
      .regex(/^\d+$/, 'Phone number must contain only numbers.')
      .min(10, 'Phone number must contain at least 10 digits.')
      .max(15, 'Phone number must not exceed 15 digits.'),

   password: z
      .string()
      .min(1, 'Password is required.')
      .min(8, 'Password must contain at least 8 characters.')
      .max(255, 'Password must not exceed 255 characters.'),
});
