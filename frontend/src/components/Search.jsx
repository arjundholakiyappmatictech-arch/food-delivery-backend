'use client';

import { SEARCH_ICON_URL } from '@/assets/icons';

export default function Search({ searchText, setSearchText }) {
   return (
      <div className="mx-auto my-[30px] flex w-[400px] rounded-[0.1cm] border border-[#BEBFC5] max-[610px]:my-[15px] max-[410px]:w-[99%]">
         <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search for restaurants or food"
            className="w-full border-none py-[5px] pl-[10px] text-[18px] font-[500] outline-none placeholder:font-[400] placeholder:text-[#A6A6A6]"
         />

         {searchText ? (
            <button type="button" onClick={() => setSearchText('')} className="mx-[10px] text-[20px]">
               ✕
            </button>
         ) : (
            <img src={SEARCH_ICON_URL} alt="Search" width={25} height={25} className="mx-[10px] my-auto" />
         )}
      </div>
   );
}
