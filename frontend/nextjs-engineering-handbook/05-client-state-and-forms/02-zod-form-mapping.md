# Zod & 422 Error Mapping

---

## 1. Pure JavaScript Zod Schemas

All form validation rules are declared using **Zod v4** in pure JavaScript. Never import or declare TypeScript types (`z.infer<typeof schema>`):

```javascript
// src/lib/validations/featureSchema.js
import { z } from 'zod';

export const featureItemSchema = z.object({
   name: z
      .string()
      .trim()
      .min(1, 'Name is required.')
      .max(100, 'Name cannot exceed 100 characters.'),
   email: z
      .string()
      .trim()
      .min(1, 'Email is required.')
      .email('Please enter a valid email address.'),
   quantity: z
      .coerce
      .number({ invalid_type_error: 'Quantity must be a number.' })
      .min(1, 'Quantity must be at least 1.'),
   status: z
      .enum(['active', 'inactive'], { required_error: 'Status is required.' })
      .default('active'),
});
```

---

## 2. Two-Phase Validation Lifecycle

Form handling operates under an automated **two-phase validation pipeline**:

```
[ User Submits Form ]
        │
        ▼
 Phase 1: Client Pre-Flight (Zod Resolver)
 ├─ Invalid ──► Display instant inline field errors (Zero network cost)
 └─ Valid   ──► Dispatch HTTP POST mutation via TanStack Query
                      │
                      ▼
               Phase 2: Laravel Server Verification
               ├─ 200 OK  ──► Reset form, toast success, invalidate cache
               ├─ 422 Err ──► mapLaravelErrorsToForm(parsed.errors, form.setError)
               └─ 500 Err ──► Generic toast.error(parsed.message)
```

---

## 3. Canonical Form Component Pattern

Here is the approved pattern connecting React Hook Form, Zod v4, shadcn/ui controls, and TanStack Query mutations:

```javascript
'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { featureItemSchema } from '@/lib/validations/featureSchema';
import { useCreateFeature } from '@/lib/hooks/useFeatureMutation';
import { mapLaravelErrorsToForm } from '@/utils/formErrors';
import { parseApiError } from '@/utils/apiError';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function FeatureForm({ onSuccess }) {
   const form = useForm({
      resolver: zodResolver(featureItemSchema),
      defaultValues: {
         name: '',
         email: '',
         quantity: 1,
         status: 'active',
      },
   });

   const createMutation = useCreateFeature();

   const onSubmit = (values) => {
      createMutation.mutate(values, {
         onSuccess: () => {
            form.reset();
            onSuccess?.();
         },
         onError: (error) => {
            const parsed = parseApiError(error);
            if (parsed.status === 422 && Object.keys(parsed.errors).length > 0) {
               // Map backend error bag directly to matching input fields:
               mapLaravelErrorsToForm(parsed.errors, form.setError);
            }
         },
      });
   };

   return (
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
         <div>
            <label className="text-sm font-medium">Name</label>
            <Input
               {...form.register('name')}
               placeholder="Enter name..."
               aria-invalid={Boolean(form.formState.errors.name)}
            />
            {form.formState.errors.name && (
               <p className="mt-1 text-xs text-destructive">
                  {form.formState.errors.name.message}
               </p>
            )}
         </div>

         <div>
            <label className="text-sm font-medium">Email</label>
            <Input
               {...form.register('email')}
               type="email"
               placeholder="Enter email..."
               aria-invalid={Boolean(form.formState.errors.email)}
            />
            {form.formState.errors.email && (
               <p className="mt-1 text-xs text-destructive">
                  {form.formState.errors.email.message}
               </p>
            )}
         </div>

         <Button type="submit" disabled={form.formState.isSubmitting || createMutation.isPending}>
            {createMutation.isPending ? 'Saving...' : 'Submit'}
         </Button>
      </form>
   );
}
```

---

## 4. The Zero `useEffect` Invariant for Derived State

Using `useEffect` to copy, calculate, or synchronize derived values is strictly forbidden. 

Calculate derived values **inline during render**:

```javascript
// ❌ Forbidden (Redundant effect & extra render cycle):
const [total, setTotal] = useState(0);
const quantity = form.watch('quantity');
const price = form.watch('price');

useEffect(() => {
   setTotal((quantity || 0) * (price || 0));
}, [quantity, price]);

// ✅ Approved (Computed inline synchronously):
const quantity = form.watch('quantity') || 0;
const price = form.watch('price') || 0;
const total = quantity * price; // React 19 Compiler optimizes automatically
```

* **Why:** `useEffect` triggers a second render pass after the initial paint, causing layout thrashing, flashing values, and unnecessary overhead. Pure render-time computation executes in microseconds with zero side effects.
