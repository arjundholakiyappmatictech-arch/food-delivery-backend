'use client';

import { useRouter } from 'next/navigation';
import { MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Label, Select, Spinner, TextInput } from 'flowbite-react';

import { createAddress } from '@/services/addressService';
import { addressSchema } from '@/lib/schemas/addressSchema';
import { parseApiError } from '@/utils/apiError';

export function AddressForm() {
   const router = useRouter();

   const {
      register,
      handleSubmit,
      setError,
      formState: { errors, isSubmitting },
   } = useForm({
      resolver: zodResolver(addressSchema),
      defaultValues: {
         label: 'home',
         address_line: '',
         city: '',
         state: '',
         pincode: '',
         latitude: '',
         longitude: '',
      },
   });

   const onSubmit = async (data) => {
      try {
         await createAddress(data);

         toast.success('Address added successfully.');

         router.replace('/');
      } catch (error) {
         const apiError = parseApiError(error);

         if (apiError.status === 422) {
            Object.entries(apiError.errors ?? {}).forEach(([field, messages]) => {
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
            <Label htmlFor="label" className="font-normal text-gray-700">
               Save address as <span className="text-red-500">*</span>
            </Label>

            <Select
               id="label"
               disabled={isSubmitting}
               color={errors.label ? 'failure' : 'gray'}
               aria-invalid={Boolean(errors.label)}
               {...register('label')}
            >
               <option value="home">Home</option>
               <option value="work">Work</option>
               <option value="other">Other</option>
            </Select>

            {errors.label?.message && (
               <p role="alert" className="text-sm text-red-600">
                  {errors.label.message}
               </p>
            )}
         </div>

         <div className="space-y-2">
            <Label htmlFor="address_line" className="font-normal text-gray-700">
               Address details <span className="text-red-500">*</span>
            </Label>

            <TextInput
               id="address_line"
               type="text"
               disabled={isSubmitting}
               placeholder="Flat, house, society, street or landmark"
               autoComplete="street-address"
               color={errors.address_line ? 'failure' : 'gray'}
               aria-invalid={Boolean(errors.address_line)}
               {...register('address_line')}
            />

            {errors.address_line?.message && (
               <p role="alert" className="text-sm text-red-600">
                  {errors.address_line.message}
               </p>
            )}
         </div>

         <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
               <Label htmlFor="city" className="font-normal text-gray-700">
                  City <span className="text-red-500">*</span>
               </Label>

               <TextInput
                  id="city"
                  type="text"
                  disabled={isSubmitting}
                  placeholder="Ahmedabad"
                  autoComplete="address-level2"
                  color={errors.city ? 'failure' : 'gray'}
                  aria-invalid={Boolean(errors.city)}
                  {...register('city')}
               />

               {errors.city?.message && (
                  <p role="alert" className="text-sm text-red-600">
                     {errors.city.message}
                  </p>
               )}
            </div>

            <div className="space-y-2">
               <Label htmlFor="state" className="font-normal text-gray-700">
                  State <span className="text-red-500">*</span>
               </Label>

               <TextInput
                  id="state"
                  type="text"
                  disabled={isSubmitting}
                  placeholder="Gujarat"
                  autoComplete="address-level1"
                  color={errors.state ? 'failure' : 'gray'}
                  aria-invalid={Boolean(errors.state)}
                  {...register('state')}
               />

               {errors.state?.message && (
                  <p role="alert" className="text-sm text-red-600">
                     {errors.state.message}
                  </p>
               )}
            </div>
         </div>

         <div className="space-y-2">
            <Label htmlFor="pincode" className="font-normal text-gray-700">
               Pincode <span className="text-red-500">*</span>
            </Label>

            <TextInput
               id="pincode"
               type="text"
               disabled={isSubmitting}
               placeholder="395002"
               inputMode="numeric"
               maxLength={6}
               autoComplete="postal-code"
               color={errors.pincode ? 'failure' : 'gray'}
               aria-invalid={Boolean(errors.pincode)}
               {...register('pincode')}
            />

            {errors.pincode?.message && (
               <p role="alert" className="text-sm text-red-600">
                  {errors.pincode.message}
               </p>
            )}
         </div>

         <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="mb-4 flex items-start gap-3">
               <MapPin className="mt-0.5 size-5 shrink-0 text-orange-600" />

               <div>
                  <p className="text-sm font-medium text-gray-900">Location coordinates</p>

                  <p className="mt-1 text-sm text-gray-500">
                     Temporary fields until map and geocoding support are added.
                  </p>
               </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
               <div className="space-y-2">
                  <Label htmlFor="latitude" className="font-normal text-gray-700">
                     Latitude <span className="text-red-500">*</span>
                  </Label>

                  <TextInput
                     id="latitude"
                     type="number"
                     step="any"
                     disabled={isSubmitting}
                     placeholder="21.1702"
                     color={errors.latitude ? 'failure' : 'gray'}
                     aria-invalid={Boolean(errors.latitude)}
                     {...register('latitude')}
                  />

                  {errors.latitude?.message && (
                     <p role="alert" className="text-sm text-red-600">
                        {errors.latitude.message}
                     </p>
                  )}
               </div>

               <div className="space-y-2">
                  <Label htmlFor="longitude" className="font-normal text-gray-700">
                     Longitude <span className="text-red-500">*</span>
                  </Label>

                  <TextInput
                     id="longitude"
                     type="number"
                     step="any"
                     disabled={isSubmitting}
                     placeholder="72.8311"
                     color={errors.longitude ? 'failure' : 'gray'}
                     aria-invalid={Boolean(errors.longitude)}
                     {...register('longitude')}
                  />

                  {errors.longitude?.message && (
                     <p role="alert" className="text-sm text-red-600">
                        {errors.longitude.message}
                     </p>
                  )}
               </div>
            </div>
         </div>

         <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-orange-600 enabled:hover:bg-orange-700 focus:ring-orange-300"
         >
            {isSubmitting && <Spinner size="sm" aria-label="Saving address" className="mr-2" />}

            {isSubmitting ? 'Saving address...' : 'Save address'}
         </Button>
      </form>
   );
}
