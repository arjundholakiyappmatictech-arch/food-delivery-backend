'use client';

import { useParams } from 'next/navigation';

import BillSummaryCard from '@/components/orders/BillSummaryCard';
import OrderHeader from '@/components/orders/OrderHeader';
import OrderedItemsCard from '@/components/orders/OrderItemsCard';
import OrderTrackingTimeline from '@/components/orders/OrderTrackingTimeline';
import OrderUserInfoCard from '@/components/orders/OrderUserInfoCard';
import RestaurantOrderCard from '@/components/orders/RestaurantOrderCard';
import useOrder from '@/lib/hooks/useOrder';
import { useRazorpay } from '@/lib/hooks/useRazorpay';
import Script from 'next/script';

export default function OrderDetailsPage() {
   const params = useParams();
   const { order, loading, error, cancelOrder } = useOrder(params.id);
   const { openRazorpayCheckout } = useRazorpay();

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

   const handlePayNow = () => {
      const payment = order.order_payment;

      if (!payment) {
         return;
      }

      openRazorpayCheckout(order, payment);
   };

   const handleCancelOrder = async () => {
      try {
         await cancelOrder(order.id);
      } catch (error) {
         console.error('Order cancellation failed:', error);
      }
   };

   const canPayNow =
      order.status === 'placed' && order.order_payment?.method === 'razorpay' && order.order_payment?.status !== 'paid';

   return (
      <main className="min-h-screen bg-[#fafafa]">
         <div className="mx-auto max-w-[1200px] px-[40px] py-8 max-[1200px]:px-[30px] max-[800px]:px-[20px] max-[560px]:px-[10px]">
            <OrderHeader order={order} />

            {canPayNow && (
               <button
                  type="button"
                  onClick={handlePayNow}
                  className="rounded-xl bg-[#E56A77] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
               >
                  Pay Now
               </button>
            )}

            {order.status === 'placed' && (
               <button
                  type="button"
                  onClick={handleCancelOrder}
                  className="ml-3 rounded-xl border border-red-500 px-6 py-3 text-sm font-semibold text-red-500 transition hover:bg-red-50"
               >
                  Cancel Order
               </button>
            )}

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
         <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      </main>
   );
}
