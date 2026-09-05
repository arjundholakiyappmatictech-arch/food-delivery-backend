import { create } from 'zustand';

import { getCart, addToCart, updateCart, removeFromCart, clearCart } from '@/services/cartServices';
import { parseApiError } from '@/utils/apiError';
import { toast } from 'react-hot-toast';

const useCartStore = create((set, get) => ({
   cartItems: [],
   loading: false,
   restaurantId: null,

   fetchCart: async () => {
      set({ loading: true });

      try {
         const response = await getCart();
         set({
            cartItems: response.data,
         });
      } catch (error) {
         const apiError = parseApiError(error);

         if (apiError.isCancelled) {
            return;
         }

         toast.error(apiError.message);
      } finally {
         set({ loading: false });
      }
   },

   addItem: async ({ menuItemId, restaurantId }) => {
      const response = await addToCart({
         restaurant_id: restaurantId,
         menu_item_id: menuItemId,
         quantity: 1,
      });

      const cartItem = response.data;

      set((state) => {
         const exists = state.cartItems.find((item) => item.id === cartItem.id);

         if (exists) {
            return {
               cartItems: state.cartItems.map((item) => (item.id === cartItem.id ? cartItem : item)),
               restaurantId,
            };
         }

         return {
            cartItems: [...state.cartItems, cartItem],
            restaurantId,
         };
      });
   },

   increaseQuantity: async (cartItem) => {
      try {
         const response = await updateCart(cartItem.id, {
            quantity: cartItem.quantity + 1,
         });

         set((state) => ({
            cartItems: state.cartItems.map((item) => (item.id === response.data.id ? response.data : item)),
         }));
      } catch (error) {
         const apiError = parseApiError(error);

         if (apiError.isCancelled) {
            return;
         }

         toast.error(apiError.message);
      }
   },

   decreaseQuantity: async (cartItem) => {
      try {
         if (cartItem.quantity === 1) {
            await removeFromCart(cartItem.id);

            set((state) => ({
               cartItems: state.cartItems.filter((item) => item.id !== cartItem.id),
            }));

            return;
         }

         const response = await updateCart(cartItem.id, {
            quantity: cartItem.quantity - 1,
         });

         set((state) => ({
            cartItems: state.cartItems.map((item) => (item.id === response.data.id ? response.data : item)),
         }));
      } catch (error) {
         const apiError = parseApiError(error);

         if (apiError.isCancelled) {
            return;
         }

         toast.error(apiError.message);
      }
   },

   clearCart: async () => {
      await clearCart();

      set({
         cartItems: [],
      });
   },
}));

export default useCartStore;
