'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { getReviews, deleteReview } from '@/services/reviewService';
import { parseApiError } from '@/utils/apiError';
import useInfiniteScroll from '@/lib/hooks/useInfiniteScroll';

export default function useReviews() {
   const [reviews, setReviews] = useState([]);
   const [page, setPage] = useState(1);
   const [hasMore, setHasMore] = useState(false);

   const [loading, setLoading] = useState(true);
   const [loadingMore, setLoadingMore] = useState(false);
   const [error, setError] = useState('');

   const [deletingReview, setDeletingReview] = useState(null);
   const [isDeleting, setIsDeleting] = useState(false);

   const loadingMoreRef = useRef(false);

   const fetchReviews = useCallback(async () => {
      try {
         setLoading(true);
         setError('');

         const response = await getReviews(1);

         const items = Array.isArray(response?.data)
            ? response.data
            : [];

         setReviews(items);
         setPage(response?.pagination?.current_page ?? 1);
         setHasMore(response?.pagination?.has_more_pages ?? false);
      } catch (error) {
         const apiError = parseApiError(error);

         setError(
            apiError.message || 'Failed to load your reviews.',
         );
      } finally {
         setLoading(false);
      }
   }, []);

   const loadMore = useCallback(async () => {
      if (loadingMoreRef.current || !hasMore) {
         return;
      }

      loadingMoreRef.current = true;
      setLoadingMore(true);
      setError('');

      try {
         const nextPage = page + 1;

         const response = await getReviews(nextPage);

         const items = Array.isArray(response?.data)
            ? response.data
            : [];

         setReviews((prev) => {
            const existingIds = new Set(
               prev.map((review) => review.id),
            );

            const newReviews = items.filter(
               (review) => !existingIds.has(review.id),
            );

            return [...prev, ...newReviews];
         });

         setPage(response?.pagination?.current_page ?? nextPage);
         setHasMore(
            response?.pagination?.has_more_pages ?? false,
         );
      } catch (error) {
         const apiError = parseApiError(error);

         setError(
            apiError.message || 'Failed to load more reviews.',
         );
      } finally {
         loadingMoreRef.current = false;
         setLoadingMore(false);
      }
   }, [page, hasMore]);

   const deleteReviewItem = useCallback(async () => {
      if (!deletingReview) {
         return;
      }

      try {
         setIsDeleting(true);

         await deleteReview(deletingReview.id);

         setReviews((prev) =>
            prev.filter(
               (review) => review.id !== deletingReview.id,
            ),
         );

         toast.success('Review deleted successfully.');

         setDeletingReview(null);
      } catch (error) {
         const apiError = parseApiError(error);

         toast.error(
            apiError.message ||
            'Unable to delete review. Please try again.',
         );
      } finally {
         setIsDeleting(false);
      }
   }, [deletingReview]);

   const loaderRef = useInfiniteScroll({
      hasMore,
      loading: loadingMore,
      onLoadMore: loadMore,
   });

   useEffect(() => {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchReviews();
   }, [fetchReviews]);

   return {
      reviews,
      loading,
      loadingMore,
      hasMore,
      error,

      deletingReview,
      setDeletingReview,
      isDeleting,

      deleteReviewItem,

      refetch: fetchReviews,
      loadMore,
      loaderRef,
   };
}
