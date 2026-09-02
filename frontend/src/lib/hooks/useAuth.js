'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useAuthStore } from '../store/useAuthStore';
import { logout } from '@/services/authService';
import { useQueryClient } from '@tanstack/react-query';
import useLocationStore from '../store/locationStore';

export default function useAuthGuard() {
   const router = useRouter();

   const clearUser = useAuthStore((state) => state.clearUser);
   const queryClient = useQueryClient();

   const clearSelectedLocation = useLocationStore((state) => state.clearSelectedLocation);

   const [logoutLoading, setLogoutLoading] = useState(false);
   const [logoutError, setLogoutError] = useState('');

   useEffect(() => {
      const token = localStorage.getItem('access_token');

      if (!token) {
         router.replace('/login');
      }
   }, [router]);

   const logoutUser = useCallback(async () => {
      try {
         setLogoutLoading(true);
         setLogoutError('');

         await logout();
      } catch (error) {
         console.error('LOGOUT ERROR:', error);

         setLogoutError(error.response?.data?.message || 'Unable to logout from the server.');
      } finally {
         localStorage.removeItem('access_token');
         clearUser();
         clearSelectedLocation();
         queryClient.clear();

         setLogoutLoading(false);
      }

      router.replace('/login');
   }, [clearSelectedLocation, clearUser, queryClient, router]);

   return {
      logoutUser,
      logoutLoading,
      logoutError,
   };
}
