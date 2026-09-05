'use client';

import { useQuery } from '@tanstack/react-query';
import { getOrders } from '@/services/orderService';
import { parseApiError } from '@/utils/apiError';

export default function useOrders() {
   const ordersQuery = useQuery({
      queryKey: ['orders'],
      queryFn: ({ signal }) => getOrders(signal),
   });

   const orders = ordersQuery.data?.data ?? ordersQuery.data ?? [];
   const apiError = ordersQuery.error ? parseApiError(ordersQuery.error) : null;

   return {
      orders: Array.isArray(orders) ? orders : [],
      loading: ordersQuery.isLoading,
      error: apiError?.message ?? '',
      refetch: ordersQuery.refetch,
   };
}
