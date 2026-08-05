
import { Header } from '@/components/layout/Header';

export default function CustomerLayout({ children }) {
   return (
      <div className="flex min-h-screen flex-col bg-white">
         <Header />

         <div className="h-[75px] shrink-0 max-[610px]:h-[60px]" />

         <main className="grow">{children}</main>
      </div>
   );
}
