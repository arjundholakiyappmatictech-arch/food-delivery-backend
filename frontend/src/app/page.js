'use client';
import useAuthGuard from '@/lib/hooks/auth';

export default function Home() {
   useAuthGuard();
   return (
      <>
         <div>Hello</div>
      </>
   );
}
