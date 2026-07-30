'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoaderCircle, MapPin } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { createAddress } from '@/services/addressService';
import { addressSchema } from '@/lib/schemas/addressSchema';

const initialForm = {
   label: 'home',
   address_line: '',
   city: '',
   state: '',
   pincode: '',
   latitude: '',
   longitude: '',
};

export function AddressForm() {
   const router = useRouter();

   const [form, setForm] = useState(initialForm);
   const [errors, setErrors] = useState({});
   const [formError, setFormError] = useState('');
   const [loading, setLoading] = useState(false);

   const handleChange = (event) => {
      const { name, value } = event.target;

      setForm((currentForm) => ({
         ...currentForm,
         [name]: value,
      }));

      setErrors((currentErrors) => ({
         ...currentErrors,
         [name]: undefined,
      }));

      setFormError('');
   };

   const handleSubmit = async (event) => {
      event.preventDefault();

      setErrors({});
      setFormError('');

      const result = addressSchema.safeParse(form);

      if (!result.success) {
         const validationErrors = {};

         result.error.issues.forEach((issue) => {
            const field = issue.path[0];

            if (field && !validationErrors[field]) {
               validationErrors[field] = issue.message;
            }
         });

         setErrors(validationErrors);

         return;
      }

      try {
         setLoading(true);

         await createAddress(result.data);

         toast.success('Address added successfully.');

         router.replace('/');
      } catch (error) {
         const backendErrors = error.response?.data?.errors;

         if (backendErrors) {
            const formattedErrors = {};

            Object.entries(backendErrors).forEach(([field, messages]) => {
               formattedErrors[field] = Array.isArray(messages) ? messages[0] : messages;
            });

            setErrors(formattedErrors);
         }

         setFormError(error.response?.data?.message || 'Unable to add address. Please try again.');
      } finally {
         setLoading(false);
      }
   };

   return (
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
         <div className="space-y-2">
            <Label htmlFor="label">
               Save address as<span className="text-red-500">*</span>
            </Label>

            <select
               id="label"
               name="label"
               value={form.label}
               disabled={loading}
               onChange={handleChange}
               className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            >
               <option value="home">Home</option>
               <option value="work">Work</option>
               <option value="other">Other</option>
            </select>

            {errors.label && <p className="text-sm text-destructive">{errors.label}</p>}
         </div>

         <div className="space-y-2">
            <Label htmlFor="address_line">
               Address details<span className="text-red-500">*</span>
            </Label>

            <Input
               id="address_line"
               name="address_line"
               value={form.address_line}
               disabled={loading}
               onChange={handleChange}
               placeholder="Flat, house, society, street or landmark"
               autoComplete="street-address"
            />

            {errors.address_line && <p className="text-sm text-destructive">{errors.address_line}</p>}
         </div>

         <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
               <Label htmlFor="city">
                  City<span className="text-red-500">*</span>
               </Label>

               <Input
                  id="city"
                  name="city"
                  value={form.city}
                  disabled={loading}
                  onChange={handleChange}
                  placeholder="Ahmedabad"
                  autoComplete="address-level2"
               />

               {errors.city && <p className="text-sm text-destructive">{errors.city}</p>}
            </div>

            <div className="space-y-2">
               <Label htmlFor="state">
                  State<span className="text-red-500">*</span>
               </Label>

               <Input
                  id="state"
                  name="state"
                  value={form.state}
                  disabled={loading}
                  onChange={handleChange}
                  placeholder="Gujarat"
                  autoComplete="address-level1"
               />

               {errors.state && <p className="text-sm text-destructive">{errors.state}</p>}
            </div>
         </div>

         <div className="space-y-2">
            <Label htmlFor="pincode">
               Pincode<span className="text-red-500">*</span>
            </Label>

            <Input
               id="pincode"
               name="pincode"
               value={form.pincode}
               disabled={loading}
               onChange={handleChange}
               placeholder="395002"
               inputMode="numeric"
               maxLength={6}
               autoComplete="postal-code"
            />

            {errors.pincode && <p className="text-sm text-destructive">{errors.pincode}</p>}
         </div>

         <div className="rounded-xl border bg-muted/30 p-4">
            <div className="mb-4 flex items-start gap-3">
               <MapPin className="mt-0.5 size-5 shrink-0 text-orange-600" />

               <div>
                  <p className="text-sm font-medium">Location coordinates</p>

                  <p className="mt-1 text-sm text-muted-foreground">
                     Temporary fields until map and geocoding support are added.
                  </p>
               </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
               <div className="space-y-2">
                  <Label htmlFor="latitude">
                     Latitude<span className="text-red-500">*</span>
                  </Label>

                  <Input
                     id="latitude"
                     name="latitude"
                     type="number"
                     step="any"
                     value={form.latitude}
                     disabled={loading}
                     onChange={handleChange}
                     placeholder="21.1702"
                  />

                  {errors.latitude && <p className="text-sm text-destructive">{errors.latitude}</p>}
               </div>

               <div className="space-y-2">
                  <Label htmlFor="longitude">
                     Longitude<span className="text-red-500">*</span>
                  </Label>

                  <Input
                     id="longitude"
                     name="longitude"
                     type="number"
                     step="any"
                     value={form.longitude}
                     disabled={loading}
                     onChange={handleChange}
                     placeholder="72.8311"
                  />

                  {errors.longitude && <p className="text-sm text-destructive">{errors.longitude}</p>}
               </div>
            </div>
         </div>

         {formError && (
            <div role="alert" className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3">
               <p className="text-sm text-destructive">{formError}</p>
            </div>
         )}

         <Button
            type="submit"
            size="lg"
            disabled={loading}
            className="h-11 w-full rounded-xl bg-orange-600 text-white hover:bg-orange-700"
         >
            {loading ? (
               <>
                  <LoaderCircle className="size-4 animate-spin" />
                  Saving address...
               </>
            ) : (
               'Save address'
            )}
         </Button>
      </form>
   );
}
