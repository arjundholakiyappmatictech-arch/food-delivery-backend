'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { registerSchema } from '@/lib/schemas/registerSchema';
import { register } from '@/services/authService';
import { formatZodErrors } from '@/utils/zodErrors';
import { parseApiError } from '@/utils/apiError';
import SubmitButton from '@/components/common/SubmitButton';
import { BorderBeam } from '@/components/ui/border-beam';

const initialForm = {
   full_name: '',
   email: '',
   phone_number: '',
   password: '',
   type: '',
};

const initialErrors = {
   full_name: [],
   email: [],
   phone_number: [],
   password: [],
   type: [],
};

const userTypes = [
   {
      label: 'Customer',
      value: 'customer',
   },
   {
      label: 'Delivery Agent',
      value: 'delivery_agent',
   },
   {
      label: 'Restaurant Owner',
      value: 'restaurant_owner',
   },
];

const RegisterForm = () => {
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

   const handleTypeChange = (value) => {
      setForm((previousForm) => ({
         ...previousForm,
         type: value,
      }));

      setErrors((previousErrors) => ({
         ...previousErrors,
         type: [],
      }));
   };

   const handleSubmit = async (event) => {
      event.preventDefault();

      const result = registerSchema.safeParse(form);

      if (!result.success) {
         const fieldErrors = formatZodErrors(result.error.issues, initialErrors);

         setErrors(fieldErrors);

         return;
      }

      try {
         setLoading(true);
         setErrors({ ...initialErrors });

         const response = await register(result.data);

         toast.success(response.message ?? 'Account created successfully.');

         router.push('/login');
      } catch (error) {
         const apiError = parseApiError(error);

         if (apiError.status === 422) {
            setErrors({
               full_name: apiError.errors.full_name ? [apiError.errors.full_name[0]] : [],

               email: apiError.errors.email ? [apiError.errors.email[0]] : [],

               phone_number: apiError.errors.phone_number ? [apiError.errors.phone_number[0]] : [],

               password: apiError.errors.password ? [apiError.errors.password[0]] : [],

               type: apiError.errors.type ? [apiError.errors.type[0]] : [],
            });

            toast.error(apiError.message);

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
                     <CardTitle className="text-2xl font-semibold">Create your account</CardTitle>

                     <CardDescription className="text-orange-400">
                        Sign up to start ordering delicious food.
                     </CardDescription>
                  </div>
               </CardHeader>

               <CardContent className="p-0">
                  <form onSubmit={handleSubmit} noValidate>
                     <FieldGroup className="gap-6">
                        <div className="flex flex-col gap-4">
                           <Field className="gap-1.5">
                              <FieldLabel htmlFor="full_name" className="text-sm font-normal text-muted-foreground">
                                 Name<span className="text-red-500">*</span>
                              </FieldLabel>

                              <Input
                                 id="full_name"
                                 type="text"
                                 name="full_name"
                                 value={form.full_name}
                                 placeholder="Enter your full name"
                                 onChange={handleChange}
                                 disabled={loading}
                                 autoComplete="name"
                                 aria-invalid={errors.full_name.length > 0}
                                 className="h-9 shadow-xs dark:bg-background"
                              />

                              {errors.full_name[0] && <p className="text-sm text-red-500">{errors.full_name[0]}</p>}
                           </Field>

                           <Field className="gap-1.5">
                              <FieldLabel htmlFor="email" className="text-sm font-normal text-muted-foreground">
                                 Email<span className="text-red-500">*</span>
                              </FieldLabel>

                              <Input
                                 id="email"
                                 type="email"
                                 name="email"
                                 value={form.email}
                                 placeholder="Enter your email"
                                 onChange={handleChange}
                                 disabled={loading}
                                 autoComplete="email"
                                 aria-invalid={errors.email.length > 0}
                                 className="h-9 shadow-xs dark:bg-background"
                              />

                              {errors.email[0] && <p className="text-sm text-red-500">{errors.email[0]}</p>}
                           </Field>

                           <Field className="gap-1.5">
                              <FieldLabel htmlFor="phone_number" className="text-sm font-normal text-muted-foreground">
                                 Phone Number<span className="text-red-500">*</span>
                              </FieldLabel>

                              <Input
                                 id="phone_number"
                                 type="tel"
                                 name="phone_number"
                                 value={form.phone_number}
                                 placeholder="Enter your phone number"
                                 onChange={handleChange}
                                 disabled={loading}
                                 autoComplete="tel"
                                 aria-invalid={errors.phone_number.length > 0}
                                 className="h-9 shadow-xs dark:bg-background"
                              />

                              {errors.phone_number[0] && (
                                 <p className="text-sm text-red-500">{errors.phone_number[0]}</p>
                              )}
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
                                 autoComplete="new-password"
                                 aria-invalid={errors.password.length > 0}
                                 className="h-9 shadow-xs dark:bg-background"
                              />

                              {errors.password[0] && <p className="text-sm text-red-500">{errors.password[0]}</p>}
                           </Field>

                           <Field className="gap-1.5">
                              <FieldLabel htmlFor="type" className="text-sm font-normal text-muted-foreground">
                                 Select Type<span className="text-red-500">*</span>
                              </FieldLabel>

                              <Select value={form.type} onValueChange={handleTypeChange} disabled={loading}>
                                 <SelectTrigger id="type" aria-invalid={errors.type.length > 0} className="w-full">
                                    <SelectValue placeholder="Select account type" />
                                 </SelectTrigger>

                                 <SelectContent>
                                    <SelectGroup>
                                       {userTypes.map((item) => (
                                          <SelectItem key={item.value} value={item.value}>
                                             {item.label}
                                          </SelectItem>
                                       ))}
                                    </SelectGroup>
                                 </SelectContent>
                              </Select>

                              {errors.type[0] && <p className="text-sm text-red-500">{errors.type[0]}</p>}
                           </Field>
                        </div>

                        <Field className="gap-4">
                           <SubmitButton loading={loading} loadingText="Creating account...">
                              Create Account
                           </SubmitButton>

                           <FieldDescription className="text-center text-sm font-normal text-muted-foreground">
                              Already have an account?{' '}
                              <Link href="/login" className="text-amber-600 hover:!text-amber-700">
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
