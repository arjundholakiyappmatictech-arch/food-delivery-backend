'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { Button, Card, Label, Spinner, TextInput } from 'flowbite-react';

import { loginSchema } from '@/lib/schemas/loginSchema';
import { login } from '@/services/authService';
import { parseApiError } from '@/utils/apiError';
import { zodResolver } from '@hookform/resolvers/zod';

const LoginForm = () => {
   const router = useRouter();

   const {
      register,
      handleSubmit,
      setError,
      formState: { errors, isSubmitting },
   } = useForm({
      resolver: zodResolver(loginSchema),
      defaultValues: {
         email: '',
         password: '',
      },
   });

   const onSubmit = async (data) => {
      try {
         const response = await login(data);

         localStorage.setItem('access_token', response.data.access_token);
         localStorage.setItem('user', JSON.stringify(response.data.user));

         toast.success(response.message ?? 'Login successful.');

         router.push('/');
         router.refresh();
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

            toast.error(apiError.message ?? 'Please check the entered information.');

            return;
         }

         if (apiError.status === 401) {
            setError('email', {
               type: 'server',
               message: apiError.message ?? 'Invalid email or password.',
            });

            toast.error(apiError.message ?? 'Invalid email or password.');

            return;
         }

         if (apiError.status === 403) {
            toast.error(apiError.message ?? 'You are not allowed to access this account.');

            return;
         }

         if (apiError.isNetworkError) {
            toast.error('Unable to connect to the server. Please check your connection.');

            return;
         }

         toast.error(apiError.message ?? 'Login failed. Please try again.');
      }
   };

   return (
      <section className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50">
         <div className="mx-auto flex min-h-screen w-full max-w-lg items-center px-4 py-10 sm:px-6">
            <Card className="w-full border-0 shadow-xl">
               <div className="space-y-6 p-2 sm:p-4">
                  <header className="space-y-1 text-center">
                     <h1 className="text-2xl font-semibold">
                        Welcome to <span className="text-orange-600">Tomato</span>
                     </h1>

                     <p className="text-sm text-gray-500">Log in to your account to continue.</p>
                  </header>

                  <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
                     <div className="space-y-4">
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
                              {...register('email')}
                              className="[&_input]:h-10"
                           />

                           {errors.email?.message && <p className="text-sm text-red-600">{errors.email.message}</p>}
                        </div>

                        <div className="space-y-1.5">
                           <Label htmlFor="password" className="font-normal text-gray-600">
                              Password <span className="text-red-500">*</span>
                           </Label>

                           <TextInput
                              id="password"
                              type="password"
                              placeholder="Enter your password"
                              autoComplete="current-password"
                              disabled={isSubmitting}
                              color={errors.password ? 'failure' : 'gray'}
                              aria-invalid={Boolean(errors.password)}
                              {...register('password')}
                              className="[&_input]:h-10"
                           />

                           {errors.password?.message && (
                              <p className="text-sm text-red-600">{errors.password.message}</p>
                           )}
                        </div>
                     </div>

                     <div className="space-y-4">
                        <Button
                           type="submit"
                           disabled={isSubmitting}
                           className="w-full bg-orange-600 enabled:hover:bg-orange-700 focus:ring-orange-300"
                        >
                           {isSubmitting && <Spinner size="sm" className="mr-2" aria-label="Signing in" />}

                           {isSubmitting ? 'Signing in...' : 'Sign in'}
                        </Button>

                        <p className="text-center text-sm text-gray-500">
                           Don't have an account?{' '}
                           <Link
                              href="/register"
                              className="font-medium text-orange-600 hover:text-orange-700 hover:underline"
                           >
                              Create an account
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

export default LoginForm;
