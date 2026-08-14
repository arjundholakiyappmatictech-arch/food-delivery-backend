'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { registerSchema } from '@/lib/schemas/registerSchema';
import { register as registerUser } from '@/services/authService';
import { parseApiError } from '@/utils/apiError';

const RegisterForm = () => {
   const router = useRouter();

   const {
      register,
      handleSubmit,
      setError,
      formState: { errors, isSubmitting },
   } = useForm({
      resolver: zodResolver(registerSchema),
   });

   const onSubmit = async (data) => {
      try {
         const response = await registerUser(data);

         toast.success(response.message ?? 'Account created successfully.');

         router.push('/login');
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

            toast.error(apiError.message ?? 'Please check your information.');

            return;
         }

         if (apiError.status === 409) {
            toast.error(apiError.message ?? 'This account already exists.');

            return;
         }

         if (apiError.status === 403) {
            toast.error(apiError.message ?? 'You are not allowed to create this account.');

            return;
         }

         if (apiError.isNetworkError) {
            toast.error('Unable to connect to the server. Please check your connection.');

            return;
         }

         toast.error(apiError.message ?? 'Registration failed. Please try again.');
      }
   };

   return (
      <main className="flex min-h-[calc(100vh-75px)] w-full items-center justify-center bg-[#FAFAFA] px-4 py-8 sm:px-6 sm:py-12 md:px-8">
         <div className="w-full max-w-lg rounded-2xl border border-[#E9E9E9] bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] sm:p-8 md:p-10">
            <header className="mb-6 text-center">
               <h1 className="text-2xl font-bold tracking-tight text-[#02060C] sm:text-3xl">Create your account</h1>

               <p className="mt-2 text-sm text-[#595959]">Sign up to start ordering delicious food.</p>
            </header>

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
               <div className="space-y-4">
                  <div>
                     <label htmlFor="full_name" className="mb-1.5 block text-sm font-medium text-[#02060C]">
                        Full name <span className="text-[#E56A77]">*</span>
                     </label>

                     <input
                        id="full_name"
                        type="text"
                        placeholder="Enter your full name"
                        autoComplete="name"
                        disabled={isSubmitting}
                        aria-invalid={Boolean(errors.full_name)}
                        aria-describedby={errors.full_name ? 'full-name-error' : undefined}
                        {...register('full_name')}
                        className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-[#02060C] placeholder:text-[#A6A6A6] transition duration-150 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-gray-50 ${
                           errors.full_name
                              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                              : 'border-[#E9E9E9] focus:border-[#E56A77] focus:ring-[#E56A77]/20'
                        }`}
                     />

                     {errors.full_name?.message && (
                        <p id="full-name-error" role="alert" className="mt-1.5 text-xs font-medium text-red-600">
                           {errors.full_name.message}
                        </p>
                     )}
                  </div>

                  <div>
                     <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-[#02060C]">
                        Email <span className="text-[#E56A77]">*</span>
                     </label>

                     <input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        autoComplete="email"
                        disabled={isSubmitting}
                        aria-invalid={Boolean(errors.email)}
                        aria-describedby={errors.email ? 'email-error' : undefined}
                        {...register('email')}
                        className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-[#02060C] placeholder:text-[#A6A6A6] transition duration-150 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-gray-50 ${
                           errors.email
                              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                              : 'border-[#E9E9E9] focus:border-[#E56A77] focus:ring-[#E56A77]/20'
                        }`}
                     />

                     {errors.email?.message && (
                        <p id="email-error" role="alert" className="mt-1.5 text-xs font-medium text-red-600">
                           {errors.email.message}
                        </p>
                     )}
                  </div>

                  <div>
                     <label htmlFor="phone_number" className="mb-1.5 block text-sm font-medium text-[#02060C]">
                        Phone number <span className="text-[#E56A77]">*</span>
                     </label>

                     <input
                        id="phone_number"
                        type="tel"
                        placeholder="Enter your phone number"
                        autoComplete="tel"
                        disabled={isSubmitting}
                        aria-invalid={Boolean(errors.phone_number)}
                        aria-describedby={errors.phone_number ? 'phone-number-error' : undefined}
                        {...register('phone_number')}
                        className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-[#02060C] placeholder:text-[#A6A6A6] transition duration-150 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-gray-50 ${
                           errors.phone_number
                              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                              : 'border-[#E9E9E9] focus:border-[#E56A77] focus:ring-[#E56A77]/20'
                        }`}
                     />

                     {errors.phone_number?.message && (
                        <p id="phone-number-error" role="alert" className="mt-1.5 text-xs font-medium text-red-600">
                           {errors.phone_number.message}
                        </p>
                     )}
                  </div>

                  <div>
                     <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-[#02060C]">
                        Password <span className="text-[#E56A77]">*</span>
                     </label>

                     <input
                        id="password"
                        type="password"
                        placeholder="Enter password"
                        autoComplete="new-password"
                        disabled={isSubmitting}
                        aria-invalid={Boolean(errors.password)}
                        aria-describedby={errors.password ? 'password-error' : undefined}
                        {...register('password')}
                        className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-[#02060C] placeholder:text-[#A6A6A6] transition duration-150 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-gray-50 ${
                           errors.password
                              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                              : 'border-[#E9E9E9] focus:border-[#E56A77] focus:ring-[#E56A77]/20'
                        }`}
                     />

                     {errors.password?.message && (
                        <p id="password-error" role="alert" className="mt-1.5 text-xs font-medium text-red-600">
                           {errors.password.message}
                        </p>
                     )}
                  </div>
               </div>

               <div className="space-y-4 pt-2">
                  <button
                     type="submit"
                     disabled={isSubmitting}
                     className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#E56A77] py-3 px-4 text-sm font-medium text-white transition-colors duration-150 hover:bg-[#D95765] active:bg-[#C84E5B] focus:outline-none focus:ring-2 focus:ring-[#E56A77]/40 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                     {isSubmitting ? (
                        <>
                           <svg
                              className="size-5 animate-spin text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              aria-hidden="true"
                           >
                              <circle
                                 className="opacity-25"
                                 cx="12"
                                 cy="12"
                                 r="10"
                                 stroke="currentColor"
                                 strokeWidth="4"
                              />
                              <path
                                 className="opacity-75"
                                 fill="currentColor"
                                 d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                           </svg>
                           <span>Creating account...</span>
                        </>
                     ) : (
                        'Create Account'
                     )}
                  </button>

                  <p className="text-center text-sm text-[#595959]">
                     Already have an account?{' '}
                     <Link
                        href="/login"
                        className="font-semibold text-[#E56A77] transition-colors hover:text-[#D95765] hover:underline"
                     >
                        Sign in
                     </Link>
                  </p>
               </div>
            </form>
         </div>
      </main>
   );
};

export default RegisterForm;
