'use client';

import { Button } from '@/components/ui/button';

export default function SubmitButton({ loading, loadingText, children, ...props }) {
   return (
      <Button
         type="submit"
         size="lg"
         disabled={loading}
         className="h-10 w-full rounded-lg bg-amber-600 text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
         {...props}
      >
         {loading ? loadingText : children}
      </Button>
   );
}
