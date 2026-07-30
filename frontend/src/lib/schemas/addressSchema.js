import { z } from 'zod';

export const addressSchema = z.object({
   label: z.enum(['home', 'work', 'other'], {
      message: 'Please select an address label.',
   }),

   address_line: z.string().trim().min(1, 'Address is required.').max(255, 'Address must not exceed 255 characters.'),

   city: z.string().trim().min(1, 'City is required.').max(100, 'City must not exceed 100 characters.'),

   state: z.string().trim().min(1, 'State is required.').max(100, 'State must not exceed 100 characters.'),

   pincode: z.string().trim().min(1, 'Pincode is required.').max(10, 'Pincode must not exceed 10 characters.'),

   latitude: z
      .string()
      .trim()
      .min(1, 'Latitude is required.')
      .refine(
         (value) => !Number.isNaN(Number(value)) && Number(value) >= -90 && Number(value) <= 90,
         'Latitude must be between -90 and 90.',
      ),

   longitude: z
      .string()
      .trim()
      .min(1, 'Longitude is required.')
      .refine(
         (value) => !Number.isNaN(Number(value)) && Number(value) >= -180 && Number(value) <= 180,
         'Longitude must be between -180 and 180.',
      ),

   is_default: z.boolean().optional(),
});
