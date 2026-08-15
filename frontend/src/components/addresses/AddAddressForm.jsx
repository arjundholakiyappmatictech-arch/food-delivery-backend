'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Home, BriefcaseBusiness, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { createAddress } from '@/services/addressService';
import { addressSchema } from '@/lib/schemas/addressSchema';
import { parseApiError } from '@/utils/apiError';

export function AddAddressForm() {
   const router = useRouter();
   const searchParams = useSearchParams();
   const from = searchParams.get('from');

   const {
      register,
      handleSubmit,
      setValue,
      watch,
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
         is_default: false,
      },
   });

   const currentLabel = watch('label');

   const onSubmit = async (data) => {
      try {
         await createAddress(data);

         toast.success('Address added successfully.');

         if (from === 'select') {
            router.replace('/addresses/select');
         } else {
            router.replace('/addresses');
         }
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
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-2.5">
         {/* Save As Pills */}
         <div>
            <label className="mb-1 block text-xs font-semibold text-[#02060C]">
               Save address as <span className="text-[#E56A77]">*</span>
            </label>

            <div className="grid grid-cols-3 gap-2">
               <button
                  type="button"
                  onClick={() => setValue('label', 'home', { shouldValidate: true })}
                  className={`flex h-8.5 cursor-pointer items-center justify-center gap-1.5 rounded-xl border text-xs font-semibold transition-all duration-150 ${
                     currentLabel === 'home'
                        ? 'border-[#E56A77] bg-[#FFF4F5] text-[#E56A77]'
                        : 'border-[#E9E9E9] bg-white text-[#595959] hover:border-gray-300'
                  }`}
               >
                  <Home className="size-3.5" />
                  <span>Home</span>
               </button>

               <button
                  type="button"
                  onClick={() => setValue('label', 'work', { shouldValidate: true })}
                  className={`flex h-8.5 cursor-pointer items-center justify-center gap-1.5 rounded-xl border text-xs font-semibold transition-all duration-150 ${
                     currentLabel === 'work'
                        ? 'border-[#E56A77] bg-[#FFF4F5] text-[#E56A77]'
                        : 'border-[#E9E9E9] bg-white text-[#595959] hover:border-gray-300'
                  }`}
               >
                  <BriefcaseBusiness className="size-3.5" />
                  <span>Work</span>
               </button>

               <button
                  type="button"
                  onClick={() => setValue('label', 'other', { shouldValidate: true })}
                  className={`flex h-8.5 cursor-pointer items-center justify-center gap-1.5 rounded-xl border text-xs font-semibold transition-all duration-150 ${
                     currentLabel === 'other'
                        ? 'border-[#E56A77] bg-[#FFF4F5] text-[#E56A77]'
                        : 'border-[#E9E9E9] bg-white text-[#595959] hover:border-gray-300'
                  }`}
               >
                  <MapPin className="size-3.5" />
                  <span>Other</span>
               </button>
            </div>

            <select className="hidden" {...register('label')}>
               <option value="home">Home</option>
               <option value="work">Work</option>
               <option value="other">Other</option>
            </select>

            {errors.label?.message && (
               <p role="alert" className="mt-0.5 text-[11px] font-medium text-red-600">
                  {errors.label.message}
               </p>
            )}
         </div>

         {/* Address Line */}
         <div>
            <label htmlFor="address_line" className="mb-1 block text-xs font-semibold text-[#02060C]">
               Address details <span className="text-[#E56A77]">*</span>
            </label>

            <input
               id="address_line"
               type="text"
               disabled={isSubmitting}
               placeholder="Flat, house no., building, street or landmark"
               autoComplete="street-address"
               aria-invalid={Boolean(errors.address_line)}
               {...register('address_line')}
               className={`h-9.5 w-full rounded-xl border bg-white px-3 text-xs sm:text-sm text-[#02060C] placeholder:text-[#A6A6A6] transition duration-150 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-gray-50 ${
                  errors.address_line
                     ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                     : 'border-[#E9E9E9] focus:border-[#E56A77] focus:ring-[#E56A77]/20'
               }`}
            />

            {errors.address_line?.message && (
               <p role="alert" className="mt-0.5 text-[11px] font-medium text-red-600">
                  {errors.address_line.message}
               </p>
            )}
         </div>

         {/* City, State & Pincode in 3-column row */}
         <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <div>
               <label htmlFor="city" className="mb-1 block text-xs font-semibold text-[#02060C]">
                  City <span className="text-[#E56A77]">*</span>
               </label>

               <input
                  id="city"
                  type="text"
                  disabled={isSubmitting}
                  placeholder="e.g. Surat"
                  autoComplete="address-level2"
                  aria-invalid={Boolean(errors.city)}
                  {...register('city')}
                  className={`h-9.5 w-full rounded-xl border bg-white px-3 text-xs sm:text-sm text-[#02060C] placeholder:text-[#A6A6A6] transition duration-150 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-gray-50 ${
                     errors.city
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                        : 'border-[#E9E9E9] focus:border-[#E56A77] focus:ring-[#E56A77]/20'
                  }`}
               />

               {errors.city?.message && (
                  <p role="alert" className="mt-0.5 text-[11px] font-medium text-red-600">
                     {errors.city.message}
                  </p>
               )}
            </div>

            <div>
               <label htmlFor="state" className="mb-1 block text-xs font-semibold text-[#02060C]">
                  State <span className="text-[#E56A77]">*</span>
               </label>

               <input
                  id="state"
                  type="text"
                  disabled={isSubmitting}
                  placeholder="e.g. Gujarat"
                  autoComplete="address-level1"
                  aria-invalid={Boolean(errors.state)}
                  {...register('state')}
                  className={`h-9.5 w-full rounded-xl border bg-white px-3 text-xs sm:text-sm text-[#02060C] placeholder:text-[#A6A6A6] transition duration-150 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-gray-50 ${
                     errors.state
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                        : 'border-[#E9E9E9] focus:border-[#E56A77] focus:ring-[#E56A77]/20'
                  }`}
               />

               {errors.state?.message && (
                  <p role="alert" className="mt-0.5 text-[11px] font-medium text-red-600">
                     {errors.state.message}
                  </p>
               )}
            </div>

            <div>
               <label htmlFor="pincode" className="mb-1 block text-xs font-semibold text-[#02060C]">
                  Pincode <span className="text-[#E56A77]">*</span>
               </label>

               <input
                  id="pincode"
                  type="text"
                  disabled={isSubmitting}
                  placeholder="e.g. 395002"
                  inputMode="numeric"
                  maxLength={6}
                  autoComplete="postal-code"
                  aria-invalid={Boolean(errors.pincode)}
                  {...register('pincode')}
                  className={`h-9.5 w-full rounded-xl border bg-white px-3 text-xs sm:text-sm text-[#02060C] placeholder:text-[#A6A6A6] transition duration-150 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-gray-50 ${
                     errors.pincode
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                        : 'border-[#E9E9E9] focus:border-[#E56A77] focus:ring-[#E56A77]/20'
                  }`}
               />

               {errors.pincode?.message && (
                  <p role="alert" className="mt-0.5 text-[11px] font-medium text-red-600">
                     {errors.pincode.message}
                  </p>
               )}
            </div>
         </div>

         {/* Coordinates Box */}
         <div className="rounded-xl border border-[#E9E9E9] bg-[#FAFAFA] p-2.5">
            <div className="mb-1 flex items-center justify-between">
               <span className="text-[11px] font-semibold text-[#02060C]">Coordinates</span>
               <span className="text-[10px] text-[#595959]">Required for delivery check</span>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
               <div>
                  <input
                     id="latitude"
                     type="number"
                     step="any"
                     disabled={isSubmitting}
                     placeholder="Latitude (e.g. 21.1702)"
                     aria-invalid={Boolean(errors.latitude)}
                     {...register('latitude')}
                     className={`h-8.5 w-full rounded-lg border bg-white px-2.5 text-xs text-[#02060C] placeholder:text-[#A6A6A6] transition duration-150 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-gray-50 ${
                        errors.latitude
                           ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                           : 'border-[#E9E9E9] focus:border-[#E56A77] focus:ring-[#E56A77]/20'
                     }`}
                  />

                  {errors.latitude?.message && (
                     <p role="alert" className="mt-0.5 text-[10px] font-medium text-red-600">
                        {errors.latitude.message}
                     </p>
                  )}
               </div>

               <div>
                  <input
                     id="longitude"
                     type="number"
                     step="any"
                     disabled={isSubmitting}
                     placeholder="Longitude (e.g. 72.8311)"
                     aria-invalid={Boolean(errors.longitude)}
                     {...register('longitude')}
                     className={`h-8.5 w-full rounded-lg border bg-white px-2.5 text-xs text-[#02060C] placeholder:text-[#A6A6A6] transition duration-150 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-gray-50 ${
                        errors.longitude
                           ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                           : 'border-[#E9E9E9] focus:border-[#E56A77] focus:ring-[#E56A77]/20'
                     }`}
                  />

                  {errors.longitude?.message && (
                     <p role="alert" className="mt-0.5 text-[10px] font-medium text-red-600">
                        {errors.longitude.message}
                     </p>
                  )}
               </div>
            </div>
         </div>

         {/* Submit Button */}
         <div className="pt-0.5">
            <button
               type="submit"
               disabled={isSubmitting}
               className="flex h-9.5 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#E56A77] px-4 text-xs sm:text-sm font-semibold text-white shadow-sm transition-colors duration-150 hover:bg-[#D95765] active:bg-[#C84E5B] focus:outline-none focus:ring-2 focus:ring-[#E56A77]/40 disabled:cursor-not-allowed disabled:opacity-60"
            >
               {isSubmitting ? (
                  <>
                     <svg
                        className="size-4 animate-spin text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                     >
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path
                           className="opacity-75"
                           fill="currentColor"
                           d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                     </svg>
                     <span>Saving address...</span>
                  </>
               ) : (
                  'Save and Continue'
               )}
            </button>
         </div>
      </form>
   );
}
