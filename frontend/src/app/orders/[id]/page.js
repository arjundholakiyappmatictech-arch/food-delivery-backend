'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

import OrderHeader from '@/components/orders/OrderHeader';
import OrderTrackingTimeline from '@/components/orders/OrderTrackingTimeline';
import RestaurantOrderCard from '@/components/orders/RestaurantOrderCard';
import BillSummaryCard from '@/components/orders/BillSummaryCard';

import OrderedItemsCard from '@/components/orders/OrderItemsCard';
import OrderUserInfoCard from '@/components/orders/OrderUserInfoCard';
import useOrder from '@/lib/hooks/useOrder';

export default function OrderDetailsPage() {
   const params = useParams();
   const orderId = params.id;

   const { fetchOrder, loading, error } = useOrder();

   const [order, setOrder] = useState(null);

   useEffect(() => {
      if (!orderId) {
         return;
      }

      const controller = new AbortController();

      let intervalId;

      const loadOrder = async () => {
         const response = await fetchOrder(orderId, controller.signal);

         if (!response) {
            return;
         }

         const updatedOrder = response.data;

         setOrder(updatedOrder);

         // Stop polling once order is completed
         if (updatedOrder.status === 'delivered') {
            clearInterval(intervalId);
         }
      };

      // Initial request
      loadOrder();

      // Poll every 5 seconds
      intervalId = setInterval(() => {
         loadOrder();
      }, 5000);

      return () => {
         controller.abort();
         clearInterval(intervalId);
      };
   }, [orderId, fetchOrder]);

   if (loading && !order) {
      return (
         <main className="flex min-h-screen items-center justify-center bg-[#fafafa]">
            <p className="text-sm text-gray-500">Loading order details...</p>
         </main>
      );
   }

   if (error && !order) {
      return (
         <main className="flex min-h-screen items-center justify-center bg-[#fafafa]">
            <p className="text-sm text-red-500">{error}</p>
         </main>
      );
   }

   if (!order) {
      return null;
   }

   return (
      <main className="min-h-screen bg-[#fafafa]">
         <div className="mx-auto max-w-[1200px] px-[40px] py-8 max-[1200px]:px-[30px] max-[800px]:px-[20px] max-[560px]:px-[10px]">
            <OrderHeader order={order} />

            <div className="mt-8 space-y-6">
               <OrderTrackingTimeline order={order} />

               <RestaurantOrderCard restaurant={order.restaurant} order={order} />

               <OrderedItemsCard items={order.order_items} />

               <BillSummaryCard order={order} />

               <OrderUserInfoCard
                  customer={order.customer}
                  payment={order.order_payment}
                  address={order.delivery_address}
               />
            </div>
         </div>
      </main>
   );
}
