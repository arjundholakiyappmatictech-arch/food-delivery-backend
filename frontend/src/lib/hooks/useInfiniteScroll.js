'use client';

import { useEffect, useRef } from 'react';

export default function useInfiniteScroll({ onLoadMore, hasMore, loading, rootRef }) {
   const loaderRef = useRef(null);

   useEffect(() => {
      const loaderElement = loaderRef.current;
      const scrollContainer = rootRef.current;

      // stop when observation is unnecessary
      if (!loaderElement || !scrollContainer || !hasMore || loading) {
         return;
      }

      const observer = new IntersectionObserver(
         (entries) => {
            const entry = entries[0];

            if (!entry.isIntersecting) {
               return;
            }
            observer.unobserve(loaderElement);

            onLoadMore();
         },
         {
            root: scrollContainer,
            rootMargin: '40px',
            threshold: 0,
         },
      );

      observer.observe(loaderElement);

      return () => {
         observer.disconnect();
      };
   }, [onLoadMore, hasMore, loading, rootRef]);

   return loaderRef;
}
