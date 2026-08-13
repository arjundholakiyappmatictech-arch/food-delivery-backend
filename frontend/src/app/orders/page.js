'use client';
import OrderCard from '@/components/orders/OrdersCard';
import { getOrders } from '@/services/orderService';
import { useState, useEffect } from 'react';

export default function OrdersPage() {
   const [orders, setOrders] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [search, setSearch] = useState('');

   const filteredOrders = orders.filter((order) => {
      const query = search.trim().toLowerCase();

      if (!query) {
         return true;
      }

      const restaurantName = order.restaurant?.name?.toLowerCase() || '';

      const menuItemNames = order.order_items.map((item) => item.menu_item?.name?.toLowerCase() || '').join(' ');

      return restaurantName.includes(query) || menuItemNames.includes(query);
   });

   useEffect(() => {
      const loadOrders = async () => {
         try {
            setLoading(true);

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

   if (loading) {
      return <div>Loading...</div>;
   }

   if (error) {
      return <div>{error}</div>;
   }

   if (orders.length === 0) {
      return <div>No orders yet.</div>;
   }

   return (
      <main className="mx-auto w-full max-w-[900px] px-4 py-8">
         <h1 className="text-3xl font-bold text-[#02060C]">My Orders</h1>

         <div className="relative mt-5">
            <input
               type="text"
               value={search}
               onChange={(event) => setSearch(event.target.value)}
               placeholder="Search restaurant or ordered items..."
               className="w-full rounded-xl border border-[#E9E9E9] bg-white px-4 py-3 text-sm text-[#02060C] outline-none transition placeholder:text-gray-400 focus:border-[#E56A77] focus:ring-1 focus:ring-[#E56A77]"
            />
         </div>
         {filteredOrders.length === 0 ? (
            <div className="mt-8 text-center">
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
