/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useEffect, useState } from 'react';

export default function NetworkStatus() {
   const [isOffline, setIsOffline] = useState(false);

   useEffect(() => {
      const handleOffline = () => {
         setIsOffline(true);
      };

      const handleOnline = () => {
         setIsOffline(false);
      };

      setIsOffline(!navigator.onLine);

      window.addEventListener('offline', handleOffline);
      window.addEventListener('online', handleOnline);

      return () => {
         window.removeEventListener('offline', handleOffline);
         window.removeEventListener('online', handleOnline);
      };
   }, []);

   if (!isOffline) {
      return null;
   }

   return (
      <div className="fixed bottom-5 left-1/2 z-[9999] -translate-x-1/2">
         <div className="flex items-center gap-3 rounded-xl border border-[#E9E9E9] bg-white px-4 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
            <div className="h-2.5 w-2.5 rounded-full bg-red-500" />

            <p className="text-sm font-medium text-[#02060C]">No internet connection</p>
         </div>
      </div>
   );
}
