'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { BorderBeam } from '@/components/ui/border-beam';
import SubmitButton from '@/components/common/SubmitButton';

import { loginSchema } from '@/lib/schemas/loginSchema';
import { login } from '@/services/authService';
import { parseApiError } from '@/utils/apiError';

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

         const accessToken = response.data.access_token;
         const user = response.data.user;

         localStorage.setItem('access_token', accessToken);
         localStorage.setItem('user', JSON.stringify(user));

         toast.success(response.message ?? 'Login successful.');

         router.push('/');
         router.refresh();
      } catch (error) {
         const apiError = parseApiError(error);

         if (apiError.status === 422) {
            if (apiError.errors?.email?.[0]) {
               setError('email', {
                  type: 'server',
                  message: apiError.errors.email[0],
               });
            }

            if (apiError.errors?.password?.[0]) {
               setError('password', {
                  type: 'server',
                  message: apiError.errors.password[0],
               });
            }

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
      <section className="min-h-screen bg-linear-to-br from-yellow-50 via-orange-50 to-red-50">
         <div className="mx-auto w-full max-w-lg px-4 py-10 sm:px-0 md:py-20">
            <Card className="relative max-w-lg gap-6 border-none px-6 py-8 sm:p-10">
               <CardHeader className="gap-6 p-0 text-center">
                  <div className="space-y-1">
                     <CardTitle className="text-2xl font-semibold">
                        Welcome to <span className="text-amber-600">Tomato</span>
                     </CardTitle>

                     <CardDescription>Log in to your account to continue.</CardDescription>
                  </div>
               </CardHeader>

               <CardContent className="p-0">
                  <form onSubmit={handleSubmit(onSubmit)} noValidate>
                     <FieldGroup className="gap-6">
                        <div className="flex flex-col gap-4">
                           <Field className="gap-1.5">
                              <FieldLabel htmlFor="email" className="text-sm font-normal text-muted-foreground">
                                 Email <span className="text-red-500">*</span>
                              </FieldLabel>

                              <Input
                                 id="email"
                                 type="email"
                                 placeholder="Enter your email"
                                 disabled={isSubmitting}
                                 aria-invalid={Boolean(errors.email)}
                                 {...register('email')}
                                 className="h-9 shadow-xs dark:bg-background"
                              />

                              {errors.email?.message && <p className="text-sm text-red-500">{errors.email.message}</p>}
                           </Field>

                           <Field className="gap-1.5">
                              <FieldLabel htmlFor="password" className="text-sm font-normal text-muted-foreground">
                                 Password <span className="text-red-500">*</span>
                              </FieldLabel>

                              <Input
                                 id="password"
                                 type="password"
                                 placeholder="Enter password"
                                 disabled={isSubmitting}
                                 aria-invalid={Boolean(errors.password)}
                                 {...register('password')}
                                 className="h-9 shadow-xs dark:bg-background"
                              />

                              {errors.password?.message && (
                                 <p className="text-sm text-red-500">{errors.password.message}</p>
                              )}
                           </Field>
                        </div>

                        <Field className="gap-4">
                           <SubmitButton loading={isSubmitting} loadingText="Signing in...">
                              Sign in
                           </SubmitButton>

                           <FieldDescription className="text-center text-sm font-normal text-muted-foreground">
                              Don&apos;t have an account?{' '}
                              <Link href="/register" className="text-amber-600 hover:text-amber-700!">
                                 Create an account
                              </Link>
                           </FieldDescription>
                        </Field>
                     </FieldGroup>
                  </form>
               </CardContent>
               <BorderBeam
                  duration={6}
                  delay={3}
                  size={400}
                  borderWidth={2}
                  className="from-transparent via-blue-500 to-transparent"
               />
            </Card>
         </div>
      </section>
   );
};

export default LoginForm;
