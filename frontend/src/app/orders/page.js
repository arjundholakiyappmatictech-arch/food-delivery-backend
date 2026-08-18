'use client';

import { useEffect, useState } from 'react';

import OrderCard from '@/components/orders/OrdersCard';
import OrderCardSkeleton from '@/components/skeletons/OrderCardSkeleton';
import { getOrders } from '@/services/orderService';
import OrderSearch from '@/components/orders/OrderSearch';

export default function OrdersPage() {
   const [orders, setOrders] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState('');
   const [search, setSearch] = useState('');

   useEffect(() => {
      const loadOrders = async () => {
         try {
            setLoading(true);
            setError('');

            const response = await getOrders();

            setOrders(response?.data ?? []);
         } catch (error) {
            console.error('ORDERS ERROR:', error);

            setError('Failed to load your orders.');
         } finally {
            setLoading(false);
         }
      };

      loadOrders();
   }, []);

   const query = search.trim().toLowerCase();

   const filteredOrders = orders.filter((order) => {
      if (!query) {
         return true;
      }

      const restaurantName =
         order.restaurant?.name?.toLowerCase() ?? '';

      const menuItemNames = (order.order_items ?? [])
         .map(
            (item) =>
               item.menu_item?.name?.toLowerCase() ?? '',
         )
         .join(' ');

      return (
         restaurantName.includes(query) ||
         menuItemNames.includes(query)
      );
   });

   if (loading) {
      return (
         <main className="mx-auto w-full max-w-[900px] px-4 py-8">
            {/* Header Skeleton */}
            <div className="animate-pulse">
               <div className="h-8 w-36 rounded bg-gray-200" />

               <div className="mt-5 h-12 w-full rounded-xl bg-gray-200" />
            </div>

            {/* Order Skeletons */}
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
               <p className="text-sm font-semibold text-red-600">
                  {error}
               </p>

               <button
                  type="button"
                  onClick={() => window.location.reload()}
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
            <h1 className="text-3xl font-bold text-[#02060C]">
               My Orders
            </h1>

            <div className="mt-10 text-center">
               <p className="text-sm font-semibold text-[#02060C]">
                  No orders yet.
               </p>

               <p className="mt-1 text-sm text-gray-500">
                  Your orders will appear here once you place one.
               </p>
            </div>
         </main>
      );
   }

   return (
      <main className="mx-auto w-full max-w-[900px] px-4 py-8">
         {/* Header */}
         <header>
            <h1 className="text-3xl font-bold text-[#02060C]">
               My Orders
            </h1>

            {/* Search */}
            <OrderSearch
               value={search}
               onChange={setSearch}
            />
         </header>

         {/* Search Result */}
         {filteredOrders.length === 0 ? (
            <div className="mt-10 text-center">
               <p className="text-sm font-medium text-[#02060C]">
                  No matching orders found.
               </p>

               <p className="mt-1 text-sm text-gray-500">
                  Try searching for a restaurant or item name.
               </p>
            </div>
         ) : (
            <div className="mt-6 space-y-5">
               {filteredOrders.map((order) => (
                  <OrderCard
                     key={order.id}
                     order={order}
                  />
               ))}
            </div>
         )}
      </main>
   );
}