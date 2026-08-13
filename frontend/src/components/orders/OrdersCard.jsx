'use client';
import { LOCATION_SVG } from '@/assets/icons';
import { useState } from 'react';
import ReviewModal from '../review/ReviewModal';

export default function OrderCard({ order }) {
   const visibleItems = order.order_items.slice(0, 2);
   const remainingItems = order.order_items.length - 2;

   const [reviewModalOpen, setReviewModalOpen] = useState(false);
   const [review, setReview] = useState(order.order_review);

   function formatOrderDate(date) {
      return new Date(date).toLocaleString('en-IN', {
         day: '2-digit',
         month: 'short',
         year: 'numeric',
         hour: 'numeric',
         minute: '2-digit',
         hour12: true,
      });
   }

   function formatOrderStatus(status) {
      return status.replaceAll('_', ' ').replace(/\b\w/g, (char) => char.toUpperCase());
   }

   return (
      <article className="rounded-2xl border border-[#E9E9E9] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
         {/* Restaurant */}
         <div className="flex items-center gap-5 p-6">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full">
               <img
                  src={order.restaurant?.image_url || '/assets/default-restaurant.jpg'}
                  alt={order.restaurant?.name || 'Restaurant'}
                  className="h-full w-full object-cover"
                  draggable={false}
               />
            </div>

            <div className="min-w-0 flex-1">
               <div className="flex items-center justify-between gap-4">
                  <h2 className="truncate text-xl font-semibold text-[#02060C]">{order.restaurant?.name}</h2>

                  <p className="shrink-0 text-sm font-medium text-gray-500">#{order.id}</p>
               </div>

               <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                  <div className="h-5 w-5 shrink-0">{LOCATION_SVG}</div>

                  <span className="truncate">{order.restaurant?.address}</span>
               </div>
            </div>
         </div>

         <div className="border-t border-[#E9E9E9]" />

         {/* Items */}
         <div className="space-y-3 px-6 py-5">
            {visibleItems.map((item) => {
               const itemTotal = Number(item.price_at_purchase) * item.quantity;

               return (
                  <div key={item.id} className="flex items-center justify-between gap-4 text-sm">
                     <p className="min-w-0 truncate text-[#02060C]">
                        {item.menu_item.name} × {item.quantity}
                     </p>

                     <p className="shrink-0 font-medium text-[#02060C]">₹{itemTotal.toFixed(2)}</p>
                  </div>
               );
            })}

            {remainingItems > 0 && <p className="pt-1 text-sm text-gray-500">+ {remainingItems} more items</p>}
         </div>

         <div className="border-t border-[#E9E9E9]" />

         {/* Order information */}
         <div className="flex items-center justify-between gap-6 px-6 py-5">
            <div>
               <p className="text-xs text-gray-500">Order Placed</p>

               <p className="mt-1 text-sm font-medium text-[#02060C]">{formatOrderDate(order.created_at)}</p>
            </div>

            <div>
               <p className="text-xs text-gray-500">Delivery Status</p>

               <p className="mt-1 text-sm font-semibold text-green-600">● {formatOrderStatus(order.status)}</p>
            </div>

            <div className="text-right">
               <p className="text-xs text-gray-500">Total</p>

               <p className="mt-1 text-lg font-bold text-[#02060C]">₹{Number(order.total).toFixed(2)}</p>
            </div>
         </div>

         <div className="border-t border-[#E9E9E9]" />

         {/* Actions */}
         <div className="mt-5 mb-3 flex px-3 items-center justify-end gap-4">
            {order.status === 'delivered' &&
               (review ? (
                  <span className="rounded-xl bg-green-50 px-5 py-2.5 text-sm font-semibold text-green-600">
                     ✓ Review Submitted
                  </span>
               ) : (
                  <button
                     type="button"
                     onClick={() => setReviewModalOpen(true)}
                     className="rounded-xl bg-[#E56A77] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#D95765]"
                  >
                     Write a Review
                  </button>
               ))}
         </div>

         <ReviewModal
            isOpen={reviewModalOpen}
            onClose={() => setReviewModalOpen(false)}
            order={order}
            onReviewSubmitted={(newReview) => {
               setReview(newReview);
            }}
         />
      </article>
   );
}
