import { create } from 'zustand';

import { getCart, addToCart, updateCart, removeFromCart, clearCart } from '@/services/cartServices';

const useCartStore = create((set, get) => ({
   cartItems: [],

   fetchCart: async () => {
      const response = await getCart();

      set({
         cartItems: response.data,
      });
   },
   addItem: async (menuItemId) => {
      const response = await addToCart({
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
}));

export default useCartStore;
