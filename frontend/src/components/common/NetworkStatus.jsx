'use client';

import { useSyncExternalStore } from 'react';

function subscribe(callback) {
   window.addEventListener('online', callback);
   window.addEventListener('offline', callback);

   return () => {
      window.removeEventListener('online', callback);
      window.removeEventListener('offline', callback);
   };
}

function getSnapshot() {
   return navigator.onLine;
}

function getServerSnapshot() {
   return true;
}

export default function NetworkStatus() {
   const isOnline = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

   if (isOnline) {
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
