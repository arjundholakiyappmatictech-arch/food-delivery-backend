'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { login as loginService } from '@/services/authService';
import { parseApiError } from '@/utils/apiError';
import { useAuthStore } from '../store/authStore';

export default function useLogin() {
   const router = useRouter();
   const queryClient = useQueryClient();
   const setUser = useAuthStore((state) => state.setUser);

   const loginMutation = useMutation({
      mutationFn: async (data) => {
         try {
            return await loginService(data);
         } catch (error) {
            throw parseApiError(error);
         }
      },

      onSuccess: (response) => {
         const { access_token, user } = response.data;

         localStorage.setItem('access_token', access_token);
         queryClient.clear();
         setUser(user);

         toast.success(response.message ?? 'Login successful.');
         router.push('/addresses/select');
      },

      onError: (error) => {
         if (error.status === 403) {
            toast.error(error.message ?? 'You are not allowed to access this account.');
            return;
         }

         if (error.isNetworkError) {
            toast.error('Unable to connect to the server. Please check your connection.');
            return;
         }

         if (error.status !== 422 && error.status !== 401) {
            toast.error(error.message ?? 'Login failed. Please try again.');
         }
      },
   });

   return {
      loginUser: loginMutation.mutateAsync,
      isLoggingIn: loginMutation.isPending,
      loginError: loginMutation.error,
   };
}
