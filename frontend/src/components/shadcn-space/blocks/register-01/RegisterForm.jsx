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
            if (apiError.errors?.full_name?.[0]) {
               setError('full_name', {
                  type: 'server',
                  message: apiError.errors.full_name[0],
               });
            }

            if (apiError.errors?.email?.[0]) {
               setError('email', {
                  type: 'server',
                  message: apiError.errors.email[0],
               });
            }

            if (apiError.errors?.phone_number?.[0]) {
               setError('phone_number', {
                  type: 'server',
                  message: apiError.errors.phone_number[0],
               });
            }

            if (apiError.errors?.password?.[0]) {
               setError('password', {
                  type: 'server',
                  message: apiError.errors.password[0],
               });
            }

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
         <div className="mx-auto w-full max-w-lg px-4 py-10 sm:px-0 md:py-20">
            <Card className="relative max-w-lg gap-6 border-none px-6 py-8 sm:p-10">
               <CardHeader className="gap-6 p-0 text-center">
                  <div className="space-y-1">
                     <CardTitle className="text-2xl font-semibold">Create your account</CardTitle>

                     <CardDescription className="text-orange-400">
                        Sign up to start ordering delicious food.
                     </CardDescription>
                  </div>
               </CardHeader>

               <CardContent className="p-0">
                  <form onSubmit={handleSubmit(onSubmit)} noValidate>
                     <FieldGroup className="gap-6">
                        <div className="flex flex-col gap-4">
                           <Field className="gap-1.5">
                              <FieldLabel htmlFor="full_name" className="text-sm font-normal text-muted-foreground">
                                 Name <span className="text-red-500">*</span>
                              </FieldLabel>

                              <Input
                                 id="full_name"
                                 type="text"
                                 placeholder="Enter your full name"
                                 autoComplete="name"
                                 disabled={isSubmitting}
                                 aria-invalid={Boolean(errors.full_name)}
                                 {...register('full_name')}
                                 className="h-9 shadow-xs dark:bg-background"
                              />

                              {errors.full_name?.message && (
                                 <p id="full-name-error" className="text-sm text-red-500">
                                    {errors.full_name.message}
                                 </p>
                              )}
                           </Field>

                           <Field className="gap-1.5">
                              <FieldLabel htmlFor="email" className="text-sm font-normal text-muted-foreground">
                                 Email <span className="text-red-500">*</span>
                              </FieldLabel>

                              <Input
                                 id="email"
                                 type="email"
                                 placeholder="Enter your email"
                                 autoComplete="email"
                                 disabled={isSubmitting}
                                 aria-invalid={Boolean(errors.email)}
                                 {...register('email')}
                                 className="h-9 shadow-xs dark:bg-background"
                              />

                              {errors.email?.message && (
                                 <p id="email-error" className="text-sm text-red-500">
                                    {errors.email.message}
                                 </p>
                              )}
                           </Field>

                           <Field className="gap-1.5">
                              <FieldLabel htmlFor="phone_number" className="text-sm font-normal text-muted-foreground">
                                 Phone Number <span className="text-red-500">*</span>
                              </FieldLabel>

                              <Input
                                 id="phone_number"
                                 type="tel"
                                 placeholder="Enter your phone number"
                                 autoComplete="tel"
                                 disabled={isSubmitting}
                                 aria-invalid={Boolean(errors.phone_number)}
                                 {...register('phone_number')}
                                 className="h-9 shadow-xs dark:bg-background"
                              />

                              {errors.phone_number?.message && (
                                 <p id="phone-number-error" className="text-sm text-red-500">
                                    {errors.phone_number.message}
                                 </p>
                              )}
                           </Field>

                           <Field className="gap-1.5">
                              <FieldLabel htmlFor="password" className="text-sm font-normal text-muted-foreground">
                                 Password <span className="text-red-500">*</span>
                              </FieldLabel>

                              <Input
                                 id="password"
                                 type="password"
                                 placeholder="Enter password"
                                 autoComplete="new-password"
                                 disabled={isSubmitting}
                                 aria-invalid={Boolean(errors.password)}
                                 {...register('password')}
                                 className="h-9 shadow-xs dark:bg-background"
                              />

                              {errors.password?.message && (
                                 <p id="password-error" className="text-sm text-red-500">
                                    {errors.password.message}
                                 </p>
                              )}
                           </Field>
                        </div>

                        <Field className="gap-4">
                           <SubmitButton loading={isSubmitting} loadingText="Creating account...">
                              Create Account
                           </SubmitButton>

                           <FieldDescription className="text-center text-sm font-normal text-muted-foreground">
                              Already have an account?{' '}
                              <Link href="/login" className="text-amber-600 hover:text-amber-700!">
                                 Sign In
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

export default RegisterForm;
