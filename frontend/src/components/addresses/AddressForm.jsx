'use client';

import { useRouter } from 'next/navigation';
import { LoaderCircle, MapPin } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { createAddress } from '@/services/addressService';
import { addressSchema } from '@/lib/schemas/addressSchema';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

export function AddressForm() {
   const router = useRouter();

   const {
      register,
      handleSubmit,
      setError,
      formState: { errors, isSubmitting },
   } = useForm({
      resolver: zodResolver(addressSchema),
   });

   const onSubmit = async (data) => {
      try {
         await createAddress(data);

         toast.success('Address added successfully.');

         router.replace('/');
      } catch (error) {
         const apiError = parseApiError(error);

         if (apiError.status === 422) {
            const backendErrors = apiError.errors ?? {};

            Object.entries(backendErrors).forEach(([field, messages]) => {
               const message = Array.isArray(messages) ? messages[0] : messages;

               if (message) {
                  setError(field, {
                     type: 'server',
                     message,
                  });
               }
            });

            toast.error(apiError.message ?? 'Please check the address details.');

            return;
         }

         if (apiError.status === 409) {
            toast.error(apiError.message ?? 'This address already exists.');

            return;
         }

         if (apiError.status === 403) {
            toast.error(apiError.message ?? 'You are not allowed to add an address.');

            return;
         }

         if (apiError.isNetworkError) {
            toast.error('Unable to connect to the server. Please check your connection.');

            return;
         }

         toast.error(apiError.message ?? 'Unable to add address. Please try again.');
      }
   };

   return (
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
         <div className="space-y-2">
            <Label htmlFor="label">
               Save address as <span className="text-red-500">*</span>
            </Label>

            <select
               id="label"
               disabled={isSubmitting}
               {...register('label')}
               className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            >
               <option value="home">Home</option>
               <option value="work">Work</option>
               <option value="other">Other</option>
            </select>

            {errors.label?.message && <p className="text-sm text-red-500">{errors.label.message}</p>}
         </div>

         <div className="space-y-2">
            <Label htmlFor="address_line">
               Address details<span className="text-red-500">*</span>
            </Label>

            <Input
               id="address_line"
               disabled={isSubmitting}
               {...register('address_line')}
               placeholder="Flat, house, society, street or landmark"
               autoComplete="street-address"
            />

            {errors.address_line?.message && <p className="text-sm text-destructive">{errors.address_line.message}</p>}
         </div>

         <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
               <Label htmlFor="city">
                  City<span className="text-red-500">*</span>
               </Label>

               <Input
                  id="city"
                  disabled={isSubmitting}
                  {...register('city')}
                  placeholder="Ahmedabad"
                  autoComplete="address-level2"
               />

               {errors.city?.message && <p className="text-sm text-destructive">{errors.city.message}</p>}
            </div>

            <div className="space-y-2">
               <Label htmlFor="state">
                  State<span className="text-red-500">*</span>
               </Label>

               <Input
                  id="state"
                  disabled={isSubmitting}
                  {...register('state')}
                  placeholder="Gujarat"
                  autoComplete="address-level1"
               />

               {errors.state?.message && <p className="text-sm text-destructive">{errors.state.message}</p>}
            </div>
         </div>

         <div className="space-y-2">
            <Label htmlFor="pincode">
               Pincode<span className="text-red-500">*</span>
            </Label>

            <Input
               id="pincode"
               disabled={isSubmitting}
               {...register('pincode')}
               placeholder="395002"
               inputMode="numeric"
               maxLength={6}
               autoComplete="postal-code"
            />

            {errors.pincode?.message && <p className="text-sm text-destructive">{errors.pincode.message}</p>}
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
                     type="number"
                     step="any"
                     disabled={isSubmitting}
                     {...register('latitude')}
                     placeholder="21.1702"
                  />

                  {errors.latitude?.message && <p className="text-sm text-destructive">{errors.latitude.message}</p>}
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
                     disabled={isSubmitting}
                     {...register('longitude')}
                     placeholder="72.8311"
                  />

                  {errors.longitude?.message && <p className="text-sm text-destructive">{errors.longitude.message}</p>}
               </div>
            </div>
         </div>

         <Button
            type="submit"
            size="lg"
            disabled={isSubmitting}
            className="h-11 w-full rounded-xl bg-orange-600 text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
         >
            {isSubmitting ? (
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
