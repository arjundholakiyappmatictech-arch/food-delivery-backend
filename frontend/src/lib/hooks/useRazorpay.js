import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

import useOrder from './useOrder';
import useCartStore from '../store/cartStore';

export const useRazorpay = () => {
   const router = useRouter();

   const fetchCart = useCartStore((state) => state.fetchCart);
   const { verifyPayment } = useOrder();

   const openRazorpayCheckout = (order, payment) => {
      const options = {
         key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
         amount: payment.amount,
         currency: payment.currency,
         order_id: payment.razorpay_order_id,

         handler: async (response) => {
            try {
               const verifyResponse = await verifyPayment(order.id, response);

               if (!verifyResponse) {
                  return;
               }

               await fetchCart();

               toast.success(`Payment successful! Order #${order.id} is confirmed and payment was received.`);

               router.push(`/orders/${order.id}`);
            } catch (error) {
               console.error('Payment verification failed:', error);
            }
         },

         modal: {
            ondismiss: async () => {
               await fetchCart();
               router.push(`/orders/${order.id}`);
            },
         },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.open();
   };

   return {
      openRazorpayCheckout,
   };
};
