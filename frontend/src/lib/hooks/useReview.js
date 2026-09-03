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

      onSuccess: () => {
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
