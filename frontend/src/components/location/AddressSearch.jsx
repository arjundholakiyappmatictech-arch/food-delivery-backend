'use client';

import { useEffect, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { useDebounce } from '@/lib/hooks/useDebounce';

export function AddressSearch({ onSearch }) {
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
      <div className="relative w-full">
         <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#98A2B3]" />

         <input
            type="text"
            value={search}
            placeholder="Search saved addresses..."
            onChange={(event) => setSearch(event.target.value)}
            autoComplete="off"
            className="w-full rounded-xl border border-[#E9E9E9] bg-white py-3 pl-11 pr-4 text-sm text-[#02060C] placeholder:text-[#A6A6A6] transition duration-150 focus:border-[#E56A77] focus:outline-none focus:ring-2 focus:ring-[#E56A77]/20"
         />
      </div>
   );
}
