import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
   return twMerge(clsx(inputs));
}

export function formatDate(date, options = {}) {
   if (!date) {
      return '';
   }

   const d = new Date(date);
   if (Number.isNaN(d.getTime())) {
      return '';
   }

   if (options.dateOnly) {
      return d.toLocaleDateString('en-IN', {
         day: 'numeric',
         month: 'short',
         year: 'numeric',
      });
   }

   return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      ...options,
   });
}
