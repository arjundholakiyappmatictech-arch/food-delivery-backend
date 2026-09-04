'use client';

import { createReview } from '@/services/reviewService';
import { parseApiError } from '@/utils/apiError';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function useReview() {
   const queryClient = useQueryClient();

   const reviewMutation = useMutation({
      mutationFn: async ({ orderId, data, signal }) => {
         try {
            return await createReview(orderId, data, signal);
         } catch (error) {
            const apiError = parseApiError(error);

            throw new Error(apiError.message || 'Unable to submit review.');
         }
      },

      onSuccess: (response) => {
         const newReview = response?.data;

         if (!newReview) {
            queryClient.invalidateQueries({
               queryKey: ['reviews'],
            });

            return;
         }

         queryClient.setQueryData(['reviews'], (oldData) => {
            if (!oldData?.pages?.length) {
               return oldData;
            }

            const alreadyExists = oldData.pages.some(
               (page) => Array.isArray(page?.data) && page.data.some((review) => review.id === newReview.id),
            );

            if (alreadyExists) {
               return oldData;
            }

            return {
               ...oldData,
               pages: oldData.pages.map((page, index) => {
                  if (index !== 0) {
                     return page;
                  }
                  return {
                     ...page,
                     data: [newReview, ...(page.data ?? [])],
                  };
               }),
            };
         });

         queryClient.invalidateQueries({
            queryKey: ['reviews'],
         });
      },
   });

   return {
      submitReview: (orderId, data, signal) =>
         reviewMutation.mutateAsync({
            orderId,
            data,
            signal,
         }),

      loading: reviewMutation.isPending,

      error: reviewMutation.error?.message || '',
   };
}
