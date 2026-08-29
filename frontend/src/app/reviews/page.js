'use client';

import { RotateCcw } from 'lucide-react';

import useAuthGuard from '@/lib/hooks/useAuth';
import useReviews from '@/lib/hooks/useReviews';
import ReviewCard from '@/components/review/ReviewCard';
import ReviewSkeleton from '@/components/skeletons/ReviewSkeleton';
import EmptyReviews from '@/components/review/EmptyReviews';
import DeleteReviewModal from '@/components/review/DeleteReviewModal';

export default function ReviewsPage() {
   useAuthGuard();

   const {
      reviews,
      loading,
      loadingMore,
      hasMore,
      error,
      deletingReview,
      setDeletingReview,
      isDeleting,
      deleteReviewItem,
      refetch,
      loaderRef,
   } = useReviews();

   return (
      <main className="mx-auto w-full max-w-[850px] px-4 py-6 sm:px-6 sm:py-8">
         <header className="mb-5 sm:mb-6">
            <h1 className="text-xl font-bold tracking-tight text-[#02060C] sm:text-2xl">
               My Reviews
            </h1>

            <p className="mt-1 text-xs text-[#595959] sm:text-sm">
               All your restaurant reviews and ratings in one place.
            </p>
         </header>

         {loading && <ReviewSkeleton count={2} />}

         {!loading && error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-center">
               <p className="text-xs font-semibold text-red-600 sm:text-sm">
                  {error}
               </p>

               <button
                  type="button"
                  onClick={refetch}
                  className="mt-3.5 inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-[#D95765] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#C74655] active:scale-[0.98]"
               >
                  <RotateCcw className="size-3.5" />
                  Try Again
               </button>
            </div>
         )}

         {!loading && !error && reviews.length === 0 && <EmptyReviews />}

         {!loading && !error && reviews.length > 0 && (
            <div className="space-y-4">
               {reviews.map((review) => (
                  <ReviewCard
                     key={review.id}
                     review={review}
                     onDelete={setDeletingReview}
                  />
               ))}

               {hasMore && (
                  <div
                     ref={loaderRef}
                     className="flex min-h-12 w-full items-center justify-center py-4"
                  >
                     {loadingMore && (
                        <div className="flex items-center gap-2 text-xs font-medium text-[#595959]">
                           <svg
                              className="size-4 animate-spin text-[#E56A77]"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              aria-hidden="true"
                           >
                              <circle
                                 className="opacity-25"
                                 cx="12"
                                 cy="12"
                                 r="10"
                                 stroke="currentColor"
                                 strokeWidth="4"
                              />

                              <path
                                 className="opacity-75"
                                 fill="currentColor"
                                 d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                           </svg>

                           <span>Loading more reviews...</span>
                        </div>
                     )}
                  </div>
               )}
            </div>
         )}

         <DeleteReviewModal
            review={deletingReview}
            isDeleting={isDeleting}
            onConfirm={deleteReviewItem}
            onCancel={() => setDeletingReview(null)}
         />
      </main>
   );
}