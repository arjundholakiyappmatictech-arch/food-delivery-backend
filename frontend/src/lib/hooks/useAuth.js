'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useAuthStore } from '../store/useAuthStore';
import { logout } from '@/services/authService';

export default function useAuthGuard() {
   const router = useRouter();

   const clearUser = useAuthStore((state) => state.clearUser);

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
         // Always clear local authentication
         localStorage.removeItem('access_token');
         clearUser();

         setLogoutLoading(false);
      }

      router.replace('/login');
   }, [clearUser, router]);

   return {
      logoutUser,
      logoutLoading,
      logoutError,
   };
}
