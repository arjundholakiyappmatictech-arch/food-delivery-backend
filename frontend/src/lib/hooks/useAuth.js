'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { logout as logoutService } from '@/services/authService';
import { parseApiError } from '@/utils/apiError';
import { useAuthStore } from '../store/authStore';
import useLocationStore from '../store/locationStore';

export function useLogout() {
   const router = useRouter();
   const queryClient = useQueryClient();
   const clearUser = useAuthStore((state) => state.clearUser);
   const clearSelectedLocation = useLocationStore((state) => state.clearSelectedLocation);

   const logoutMutation = useMutation({
      mutationFn: async () => {
         try {
            return await logoutService();
         } catch (error) {
            throw parseApiError(error);
         }
      },

      onSettled: () => {
         localStorage.removeItem('access_token');
         clearUser();
         clearSelectedLocation();
         queryClient.clear();
         router.replace('/login');
      },
   });

   return {
      logoutUser: logoutMutation.mutateAsync,
      logoutLoading: logoutMutation.isPending,
      logoutError: logoutMutation.error?.message ?? '',
   };
}

export default function useAuthGuard() {
   const router = useRouter();
   const { logoutUser, logoutLoading, logoutError } = useLogout();

   useEffect(() => {
      const token = localStorage.getItem('access_token');

      if (!token) {
         router.replace('/login');
      }
   }, [router]);

   return {
      logoutUser,
      logoutLoading,
      logoutError,
   };
}
