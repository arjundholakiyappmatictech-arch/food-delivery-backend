'use client';

import { Star, Trash2 } from 'lucide-react';

export default function ReviewCard({ review, onDelete }) {
   const order = review.order;

   const rating = Number(review.rating) || 0;
   const comment = review.comment || '';

   const orderId = order?.id;

   const rawDate = review.created_at || order?.delivered_at || order?.created_at;

   const formatReviewDate = (dateString) => {
      if (!dateString) {
         return '';
      }

      const date = new Date(dateString);

      if (Number.isNaN(date.getTime())) {
         return '';
      }

      return date.toLocaleDateString('en-GB', {
         day: 'numeric',
         month: 'short',
         year: 'numeric',
      });
   };

   const formattedDate = formatReviewDate(rawDate);

   return (
      <article
         className="
            rounded-xl
            border border-[#E9E9E9]
            bg-white
            p-4
            shadow-[0_2px_8px_rgba(0,0,0,0.02)]
            transition
            hover:border-[#E56A77]/40
            hover:shadow-[0_4px_12px_rgba(229,106,119,0.06)]
         "
      >
         {/* Header */}
         <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
               <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[#02060C]">Order #{orderId}</span>

                  {order?.status && (
                     <span
                        className="
                           rounded-full
                           bg-[#F8F8F8]
                           px-2
                           py-0.5
                           text-[10px]
                           font-medium
                           capitalize
                           text-[#747474]
                        "
                     >
                        {order.status}
                     </span>
                  )}
               </div>

               {formattedDate && <p className="mt-1 text-xs text-[#8C8C8C]">{formattedDate}</p>}
            </div>

            {/* Delete */}
            {onDelete && (
               <button
                  type="button"
                  onClick={() => onDelete(review)}
                  aria-label="Delete review"
                  className="
                     shrink-0
                     cursor-pointer
                     rounded-lg
                     p-1.5
                     text-[#A6A6A6]
                     transition
                     hover:bg-red-50
                     hover:text-red-600
                  "
               >
                  <Trash2 className="h-4 w-4" />
               </button>
            )}
         </div>

         {/* Rating */}
         <div className="mt-4 flex items-center gap-2">
            <div className="flex items-center gap-0.5">
               {[1, 2, 3, 4, 5].map((star) => {
                  const filled = star <= Math.round(rating);

                  return (
                     <Star
                        key={star}
                        className={
                           filled ? 'h-4 w-4 fill-[#E56A77] text-[#E56A77]' : 'h-4 w-4 fill-[#E9E9E9] text-[#E9E9E9]'
                        }
                     />
                  );
               })}
            </div>

            <span className="text-sm font-semibold text-[#02060C]">{rating.toFixed(1)}</span>
         </div>

         {/* Comment */}
         {comment ? (
            <p className="mt-3 break-words text-sm leading-relaxed text-[#595959]">{comment}</p>
         ) : (
            <p className="mt-3 text-xs italic text-[#A6A6A6]">No written comment provided.</p>
         )}

         {/* Order Summary */}
         {order && (
            <div
               className="
                  mt-4
                  flex
                  items-center
                  justify-between
                  gap-3
                  rounded-lg
                  bg-[#F8F8F8]
                  px-3
                  py-2.5
               "
            >
               <span className="text-xs font-medium text-[#595959]">Order total</span>

               <span className="text-xs font-semibold text-[#02060C]">₹{Number(order.total || 0).toFixed(2)}</span>
            </div>
         )}
      </article>
   );
}
