'use client';

import { useEffect, useState, useRef } from 'react';
import { Search } from 'lucide-react';

import { Input } from '@/components/ui/input';
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
      <div className="relative">
         <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

         <Input
            type="text"
            value={search}
            placeholder="Search saved address..."
            onChange={(event) => setSearch(event.target.value)}
            className="pl-10 border"
            autoComplete="off"
         />
      </div>
   );
}
