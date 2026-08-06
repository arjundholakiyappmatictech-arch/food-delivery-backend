'use client';

import { SEARCH_ICON_URL } from '@/assets/icons';

export default function Search({ searchText, setSearchText }) {
   return (
      <div className="search-bar w-[400px] flex justify-between mx-auto my-[30px] border border-[#BEBFC5] rounded-[0.1cm] max-[610px]:my-[15px] max-[410px]:w-[99%]">
         <input
            className="py-[5px] pl-[10px] text-[18px] font-[500] outline-none border-none placeholder:font-[400] placeholder:text-[#A6A6A6] w-full"
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={(e) => {
               if (e.key === 'Enter') {
                  setSearchText(e.target.value);
               }
            }}
            placeholder="Search for restaurants"
         />

         {searchText === '' ? (
            <img src={SEARCH_ICON_URL} alt="search" className="w-[25px] h-[25px] my-auto mx-[10px]" draggable="false" />
         ) : (
            <div className="text-[20px] my-auto mx-[10px] cursor-pointer" onClick={() => setSearchText('')}>
               ✖
            </div>
         )}
      </div>
   );
}
