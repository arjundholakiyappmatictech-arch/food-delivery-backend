'use client';

import { useEffect, useRef, useState } from 'react';
import { Search } from 'lucide-react';

import { useDebounce } from '@/lib/hooks/useDebounce';

export default function AddressSearch({ onSearch }) {
   const [search, setSearch] = useState('');
   const firstRender = useRef(true);
   const debouncedSearch = useDebounce(search);

   useEffect(() => {
      if (firstRender.current) {
         firstRender.current = false;
         return;
      }

      onSearch(debouncedSearch.trim());
   }, [debouncedSearch, onSearch]);

   return (
      <div className="relative">
         <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#667085]" />

         <input
            type="text"
            value={search}
            placeholder="Search saved address..."
            onChange={(event) => setSearch(event.target.value)}
            autoComplete="off"
            className="h-13 w-full rounded-xl border border-[#d9dee7] bg-white pl-12 pr-4 text-sm font-medium text-[#121826] shadow-[0_1px_2px_rgba(16,24,40,0.03)] transition placeholder:text-[#8a94a6] focus:border-[#ef3b0a] focus:outline-none focus:ring-4 focus:ring-[#ef3b0a]/10"
         />
      </div>
   );
}
