import { create } from 'zustand';

import { getCart, addToCart, updateCart, removeFromCart, clearCart } from '@/services/cartServices';

const useCartStore = create((set, get) => ({
   cartItems: [],
   loading: false,

   fetchCart: async () => {
      set({ loading: true });

      try {
         const response = await getCart();

         set({
            cartItems: response.data,
            loading: false,
         });
      } catch (error) {
         set({ loading: false });
         throw error;
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
            };
         }

         return {
            cartItems: [...state.cartItems, cartItem],
         };
      });
   },

   increaseQuantity: async (cartItem) => {
      const response = await updateCart(cartItem.id, {
         quantity: cartItem.quantity + 1,
      });

      set((state) => ({
         cartItems: state.cartItems.map((item) => (item.id === response.data.id ? response.data : item)),
      }));
   },

   decreaseQuantity: async (cartItem) => {
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
   },

   clearCart: async () => {
      await clearCart();

      set({
         cartItems: [],
      });
   },
}));

export default useCartStore;
