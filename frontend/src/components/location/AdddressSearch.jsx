'use client';

import { useEffect, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { TextInput } from 'flowbite-react';

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
      <TextInput
         type="text"
         icon={Search}
         value={search}
         placeholder="Search saved address..."
         onChange={(event) => setSearch(event.target.value)}
         autoComplete="off"
      />
   );
}
