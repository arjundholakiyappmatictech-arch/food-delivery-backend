'use client';

import useInfiniteScroll from '@/lib/hooks/useInfiniteScroll';
import { deleteReview, getReviews } from '@/services/reviewService';
import { parseApiError } from '@/utils/apiError';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

export default function useReviews() {
   const queryClient = useQueryClient();

   const [deletingReview, setDeletingReview] = useState(null);

   const reviewsQuery = useInfiniteQuery({
      queryKey: ['reviews'],

      queryFn: ({ pageParam = 1, signal }) => getReviews(pageParam, signal),

      initialPageParam: 1,

      getNextPageParam: (lastPage) => {
         if (!lastPage?.pagination?.has_more_pages) {
            return undefined;
         }

         return (lastPage.pagination.current_page ?? 1) + 1;
      },

      refetchOnMount: true,
   });

   const deleteMutation = useMutation({
      mutationFn: (reviewId) => deleteReview(reviewId),

      onSuccess: (_, reviewId) => {
         queryClient.setQueryData(['reviews'], (oldData) => {
            if (!oldData) {
               return oldData;
            }

            return {
               ...oldData,
               pages: oldData.pages.map((page) => ({
                  ...page,
                  data: Array.isArray(page?.data) ? page.data.filter((review) => review.id !== reviewId) : [],
               })),
            };
         });

         queryClient.invalidateQueries({
            queryKey: ['reviews'],
         });

         toast.success('Review deleted successfully.');

         setDeletingReview(null);
      },

      onError: (error) => {
         const apiError = parseApiError(error);

         toast.error(apiError.message || 'Unable to delete review. Please try again.');
      },
   });

   const reviews =
      reviewsQuery.data?.pages
         .flatMap((page) => (Array.isArray(page?.data) ? page.data : []))
         .filter((review, index, allReviews) => index === allReviews.findIndex((item) => item.id === review.id)) ?? [];

   const hasMore = Boolean(reviewsQuery.hasNextPage);

   const loadMore = () => {
      if (!reviewsQuery.hasNextPage || reviewsQuery.isFetchingNextPage) {
         return;
      }

      reviewsQuery.fetchNextPage();
   };

   const deleteReviewItem = async () => {
      if (!deletingReview || deleteMutation.isPending) {
         return;
      }

      await deleteMutation.mutateAsync(deletingReview.id);
   };

   const loaderRef = useInfiniteScroll({
      hasMore,
      loading: reviewsQuery.isFetchingNextPage,
      onLoadMore: loadMore,
   });

   const apiError = reviewsQuery.error ? parseApiError(reviewsQuery.error) : null;

   return {
      reviews,
      loading: reviewsQuery.isLoading,
      loadingMore: reviewsQuery.isFetchingNextPage,
      hasMore,
      error: apiError?.message || '',
      deletingReview,
      setDeletingReview,
      isDeleting: deleteMutation.isPending,
      deleteReviewItem,
      refetch: reviewsQuery.refetch,
      loadMore,
      loaderRef,
   };
}
