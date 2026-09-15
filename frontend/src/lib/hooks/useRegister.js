'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useMutation } from '@tanstack/react-query';

import { register as registerService } from '@/services/authService';
import { parseApiError } from '@/utils/apiError';

export default function useRegister() {
   const router = useRouter();

   const registerMutation = useMutation({
      mutationFn: async (data) => {
         try {
            return await registerService(data);
         } catch (error) {
            throw parseApiError(error);
         }
      },

      onSuccess: (response) => {
         toast.success(response.message ?? 'Registration successful. Please log in.');
         router.push('/login');
      },

      onError: (error) => {
         if (error.status === 409) {
            toast.error(error.message ?? 'User already exists.');
            return;
         }

         if (error.isNetworkError) {
            toast.error('Unable to connect to the server. Please check your connection.');
            return;
         }

         if (error.status !== 422) {
            toast.error(error.message ?? 'Registration failed. Please try again.');
         }
      },
   });

   return {
      registerUser: registerMutation.mutateAsync,
      isRegistering: registerMutation.isPending,
      registerError: registerMutation.error,
   };
}
