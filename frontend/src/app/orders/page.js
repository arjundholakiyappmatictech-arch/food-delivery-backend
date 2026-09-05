'use client';

import { useState } from 'react';

import OrderCard from '@/components/orders/OrdersCard';
import OrderCardSkeleton from '@/components/skeletons/OrderCardSkeleton';
import OrderSearch from '@/components/orders/OrderSearch';
import useOrders from '@/lib/hooks/useOrders';

export default function OrdersPage() {
   const [search, setSearch] = useState('');
   const { orders, loading, error, refetch } = useOrders();

   const query = search.trim().toLowerCase();

   const filteredOrders = orders.filter((order) => {
      if (!query) {
         return true;
      }

      const restaurantName = order.restaurant?.name?.toLowerCase() ?? '';

      const menuItemNames = (order.order_items ?? [])
         .map((item) => item.menu_item?.name?.toLowerCase() ?? '')
         .join(' ');

      return restaurantName.includes(query) || menuItemNames.includes(query);
   });

   if (loading) {
      return (
         <main className="mx-auto w-full max-w-[900px] px-4 py-8">
            <div className="animate-pulse">
               <div className="h-8 w-36 rounded bg-gray-200" />

               <div className="mt-5 h-12 w-full rounded-xl bg-gray-200" />
            </div>

            <div className="mt-6">
               <OrderCardSkeleton count={2} />
            </div>
         </main>
      );
   }

   if (error) {
      return (
         <main className="mx-auto w-full max-w-[900px] px-4 py-8">
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
               <p className="text-sm font-semibold text-red-600">{error}</p>

               <button
                  type="button"
                  onClick={() => refetch()}
                  className="mt-4 rounded-xl bg-[#D95765] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#C74655]"
               >
                  Try Again
               </button>
            </div>
         </main>
      );
   }

   if (orders.length === 0) {
      return (
         <main className="mx-auto w-full max-w-[900px] px-4 py-8">
            <h1 className="text-3xl font-bold text-[#02060C]">My Orders</h1>

            <div className="mt-10 text-center">
               <p className="text-sm font-semibold text-[#02060C]">No orders yet.</p>

               <p className="mt-1 text-sm text-gray-500">Your orders will appear here once you place one.</p>
            </div>
         </main>
      );
   }

   return (
      <main className="mx-auto w-full max-w-[900px] px-4 py-8">
         <header>
            <h1 className="text-3xl font-bold text-[#02060C]">My Orders</h1>

            <OrderSearch value={search} onChange={setSearch} />
         </header>

         {filteredOrders.length === 0 ? (
            <div className="mt-10 text-center">
               <p className="text-sm font-medium text-[#02060C]">No matching orders found.</p>

               <p className="mt-1 text-sm text-gray-500">Try searching for a restaurant or item name.</p>
            </div>
         ) : (
            <div className="mt-6 space-y-5">
               {filteredOrders.map((order) => (
                  <OrderCard key={order.id} order={order} />
               ))}
            </div>
         )}
      </main>
   );
}
