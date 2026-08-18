'use client';

import useReview from '@/lib/hooks/useReview';
import { useState } from 'react';

export default function ReviewModal({ isOpen, onClose, order, onReviewSubmitted }) {
   const [rating, setRating] = useState(0);
   const [comment, setComment] = useState('');

   const { submitReview, loading, error } = useReview();

   if (!isOpen) {
      return null;
   }

   const handleSubmit = async () => {
      if (!rating) {
         return;
      }

      const controller = new AbortController();

      const response = await submitReview(
         order.id,
         {
            rating,
            comment,
         },
         controller.signal,
      );

      if (!response) {
         return;
      }

      onReviewSubmitted?.(response.data);

      setRating(0);
      setComment('');
      onClose();
   };

   return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
         <div className="relative w-full max-w-[500px] rounded-2xl bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
            <button
               type="button"
               onClick={onClose}
               disabled={loading}
               className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full text-xl text-gray-500 transition hover:bg-gray-100 hover:text-[#02060C]"
            >
               ×
            </button>

            <div className="pr-10">
               <h2 className="text-2xl font-semibold text-[#02060C]">Write a Review</h2>

               <p className="mt-2 text-sm text-gray-500">
                  How was your experience with{' '}
                  <span className="font-medium text-[#02060C]">{order.restaurant.name}</span>?
               </p>
            </div>

            <div className="mt-7 text-center">
               <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                     <button
                        key={star}
                        type="button"
                        disabled={loading}
                        onClick={() => setRating(star)}
                        className={`text-4xl leading-none transition-transform hover:scale-110 ${star <= rating ? 'text-[#E56A77]' : 'text-[#D9D9D9]'
                           }`}
                     >
                        ★
                     </button>
                  ))}
               </div>

               <p className="mt-2 text-sm text-gray-500">{rating === 0 ? 'Tap to rate' : `${rating} out of 5`}</p>
            </div>

            <div className="mt-7">
               <div className="flex items-center justify-between">
                  <label htmlFor="review-comment" className="text-sm font-semibold text-[#02060C]">
                     Your Review
                  </label>

                  <span className="text-xs text-gray-400">{comment.length} / 500</span>
               </div>

               <textarea
                  id="review-comment"
                  value={comment}
                  disabled={loading}
                  onChange={(event) => setComment(event.target.value.slice(0, 500))}
                  placeholder="Tell us about your experience..."
                  rows={5}
                  className="mt-2 w-full resize-none rounded-xl border border-[#E9E9E9] px-4 py-3 text-sm text-[#02060C] outline-none transition placeholder:text-gray-400 focus:border-[#E56A77] focus:ring-1 focus:ring-[#E56A77]"
               />
            </div>

            {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

            <div className="mt-6 flex items-center justify-end gap-3">
               <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="rounded-xl border border-[#E9E9E9] px-5 py-2.5 text-sm font-semibold text-[#02060C] transition hover:border-[#E56A77] hover:text-[#E56A77]"
               >
                  Cancel
               </button>

               <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!rating || loading}
                  className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition ${rating && !loading
                        ? 'bg-[#D95765] text-white hover:bg-[#C74655]'
                        : 'cursor-not-allowed bg-[#F1F1F1] text-[#999999]'
                     }`}
               >
                  {loading ? 'Submitting...' : 'Submit Review'}
               </button>
            </div>
         </div>
      </div>
   );
}
