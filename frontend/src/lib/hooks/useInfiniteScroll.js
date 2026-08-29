'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export default function useInfiniteScroll({ onLoadMore, hasMore, loading, rootRef }) {
   const loaderRef = useRef(null);
   const [loaderReady, setLoaderReady] = useState(false);

   const setLoaderRef = useCallback((element) => {
      loaderRef.current = element;
      setLoaderReady(Boolean(element));
   }, []);

   useEffect(() => {
      const loaderElement = loaderRef.current;

      if (!loaderElement || !hasMore || loading) {
         return;
      }

      const observer = new IntersectionObserver(
         (entries) => {
            const entry = entries[0];

            if (!entry.isIntersecting) {
               return;
            }

            // Prevent duplicate trigger fires while the next page request is in flight
            observer.unobserve(loaderElement);

            onLoadMore();
         },
         {
            root: rootRef?.current ?? null,
            // Preload next page before the user reaches the absolute bottom
            rootMargin: '600px',
            threshold: 0,
         },
      );

      observer.observe(loaderElement);

      return () => {
         observer.disconnect();
      };
   }, [onLoadMore, hasMore, loading, rootRef, loaderReady]);

   return setLoaderRef;
}
