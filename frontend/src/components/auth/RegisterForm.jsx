'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Card, Label, Spinner, TextInput } from 'flowbite-react';

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
      <section className="min-h-screen bg-linear-to-br from-yellow-50 via-orange-50 to-red-50">
         <div className="mx-auto flex min-h-screen w-full max-w-lg items-center px-4 py-10 sm:px-6">
            <Card className="w-full border-0 shadow-xl">
               <div className="space-y-6 p-2 sm:p-4">
                  <header className="space-y-1 text-center">
                     <h1 className="text-2xl font-semibold text-gray-900">Create your account</h1>

                     <p className="text-sm text-orange-500">Sign up to start ordering delicious food.</p>
                  </header>

                  <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
                     <div className="space-y-4">
                        <div className="space-y-1.5">
                           <Label htmlFor="full_name" className="font-normal text-gray-600">
                              Name <span className="text-red-500">*</span>
                           </Label>

                           <TextInput
                              id="full_name"
                              type="text"
                              placeholder="Enter your full name"
                              autoComplete="name"
                              disabled={isSubmitting}
                              color={errors.full_name ? 'failure' : 'gray'}
                              aria-invalid={Boolean(errors.full_name)}
                              aria-describedby={errors.full_name ? 'full-name-error' : undefined}
                              {...register('full_name')}
                              className="[&_input]:h-10"
                           />

                           {errors.full_name?.message && (
                              <p id="full-name-error" role="alert" className="text-sm text-red-600">
                                 {errors.full_name.message}
                              </p>
                           )}
                        </div>

                        <div className="space-y-1.5">
                           <Label htmlFor="email" className="font-normal text-gray-600">
                              Email <span className="text-red-500">*</span>
                           </Label>

                           <TextInput
                              id="email"
                              type="email"
                              placeholder="Enter your email"
                              autoComplete="email"
                              disabled={isSubmitting}
                              color={errors.email ? 'failure' : 'gray'}
                              aria-invalid={Boolean(errors.email)}
                              aria-describedby={errors.email ? 'email-error' : undefined}
                              {...register('email')}
                              className="[&_input]:h-10"
                           />

                           {errors.email?.message && (
                              <p id="email-error" role="alert" className="text-sm text-red-600">
                                 {errors.email.message}
                              </p>
                           )}
                        </div>

                        <div className="space-y-1.5">
                           <Label htmlFor="phone_number" className="font-normal text-gray-600">
                              Phone number <span className="text-red-500">*</span>
                           </Label>

                           <TextInput
                              id="phone_number"
                              type="tel"
                              placeholder="Enter your phone number"
                              autoComplete="tel"
                              disabled={isSubmitting}
                              color={errors.phone_number ? 'failure' : 'gray'}
                              aria-invalid={Boolean(errors.phone_number)}
                              aria-describedby={errors.phone_number ? 'phone-number-error' : undefined}
                              {...register('phone_number')}
                              className="[&_input]:h-10"
                           />

                           {errors.phone_number?.message && (
                              <p id="phone-number-error" role="alert" className="text-sm text-red-600">
                                 {errors.phone_number.message}
                              </p>
                           )}
                        </div>

                        <div className="space-y-1.5">
                           <Label htmlFor="password" className="font-normal text-gray-600">
                              Password <span className="text-red-500">*</span>
                           </Label>

                           <TextInput
                              id="password"
                              type="password"
                              placeholder="Enter password"
                              autoComplete="new-password"
                              disabled={isSubmitting}
                              color={errors.password ? 'failure' : 'gray'}
                              aria-invalid={Boolean(errors.password)}
                              aria-describedby={errors.password ? 'password-error' : undefined}
                              {...register('password')}
                              className="[&_input]:h-10"
                           />

                           {errors.password?.message && (
                              <p id="password-error" role="alert" className="text-sm text-red-600">
                                 {errors.password.message}
                              </p>
                           )}
                        </div>
                     </div>

                     <div className="space-y-4">
                        <Button
                           type="submit"
                           disabled={isSubmitting}
                           className="w-full bg-orange-600 enabled:hover:bg-orange-700 focus:ring-orange-300"
                        >
                           {isSubmitting && <Spinner aria-label="Creating account" size="sm" className="mr-2" />}

                           {isSubmitting ? 'Creating account...' : 'Create Account'}
                        </Button>

                        <p className="text-center text-sm text-gray-500">
                           Already have an account?{' '}
                           <Link
                              href="/login"
                              className="font-medium text-orange-600 hover:text-orange-700 hover:underline"
                           >
                              Sign in
                           </Link>
                        </p>
                     </div>
                  </form>
               </div>
            </Card>
         </div>
      </section>
   );
};

export default RegisterForm;
