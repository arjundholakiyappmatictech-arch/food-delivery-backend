'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

import { loginSchema } from '@/lib/schemas/loginSchema';
import { login } from '@/services/authService';
import { formatZodErrors } from '@/utils/zodErrors';
import { parseApiError } from '@/utils/apiError';
import SubmitButton from '@/components/common/SubmitButton';
import { BorderBeam } from '@/components/ui/border-beam';

const initialForm = {
   email: '',
   password: '',
};

const initialErrors = {
   email: [],
   password: [],
};

const LoginForm = () => {
   const router = useRouter();

   const [form, setForm] = useState(initialForm);
   const [errors, setErrors] = useState(initialErrors);
   const [loading, setLoading] = useState(false);

   const handleChange = (event) => {
      const { name, value } = event.target;

      setForm((previousForm) => ({
         ...previousForm,
         [name]: value,
      }));

      setErrors((previousErrors) => ({
         ...previousErrors,
         [name]: [],
      }));
   };

   const handleSubmit = async (event) => {
      event.preventDefault();

      const result = loginSchema.safeParse(form);

      if (!result.success) {
         const fieldErrors = formatZodErrors(result.error.issues, initialErrors);

         setErrors(fieldErrors);

         return;
      }

      try {
         setLoading(true);
         setErrors({ ...initialErrors });

         const response = await login(result.data);

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
            setErrors({
               email: apiError.errors.email ? [apiError.errors.email[0]] : [],
               password: apiError.errors.password ? [apiError.errors.password[0]] : [],
            });

            toast.error(apiError.message);

            return;
         }

         if (apiError.status === 401) {
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
      } finally {
         setLoading(false);
      }
   };

   return (
      <section className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50">
         <div className="mx-auto w-full max-w-lg px-4 py-10 sm:px-0 md:py-20">
            <Card className="relative max-w-lg gap-6 px-6 py-8 sm:p-10 border-none">
               <CardHeader className="gap-6 p-0 text-center">
                  <div className="space-y-1">
                     <CardTitle className="text-2xl font-semibold">
                        Welcome to <span className="text-amber-600">Tomato</span>
                     </CardTitle>

                     <CardDescription>Log in to your account to continue.</CardDescription>
                  </div>
               </CardHeader>

               <CardContent className="p-0">
                  <form onSubmit={handleSubmit} noValidate>
                     <FieldGroup className="gap-6">
                        <div className="flex flex-col gap-4">
                           <Field className="gap-1.5">
                              <FieldLabel htmlFor="email" className="text-sm font-normal text-muted-foreground">
                                 Email <span className="text-red-500">*</span>
                              </FieldLabel>

                              <Input
                                 id="email"
                                 type="email"
                                 name="email"
                                 value={form.email}
                                 placeholder="Enter your email"
                                 onChange={handleChange}
                                 disabled={loading}
                                 aria-invalid={errors.email.length > 0}
                                 className="h-9 shadow-xs dark:bg-background"
                              />

                              {errors.email[0] && <p className="text-sm text-red-500">{errors.email[0]}</p>}
                           </Field>

                           <Field className="gap-1.5">
                              <FieldLabel htmlFor="password" className="text-sm font-normal text-muted-foreground">
                                 Password<span className="text-red-500">*</span>
                              </FieldLabel>

                              <Input
                                 id="password"
                                 type="password"
                                 name="password"
                                 value={form.password}
                                 placeholder="Enter password"
                                 onChange={handleChange}
                                 disabled={loading}
                                 aria-invalid={errors.password.length > 0}
                                 className="h-9 shadow-xs dark:bg-background"
                              />

                              {errors.password[0] && <p className="text-sm text-red-500">{errors.password[0]}</p>}
                           </Field>
                        </div>

                        <Field className="gap-4">
                           <SubmitButton loading={loading} loadingText="Signing in...">
                              Sign in
                           </SubmitButton>

                           <FieldDescription className="text-center text-sm font-normal text-muted-foreground">
                              Don&apos;t have an account?{' '}
                              <Link href="/register" className="text-amber-600 hover:!text-amber-700">
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
