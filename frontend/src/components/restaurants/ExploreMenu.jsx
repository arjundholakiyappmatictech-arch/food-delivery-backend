import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export default function ExploreMenu({ menus = [], selectedMenuName, setSelectedMenuName }) {
   const router = useRouter();
   const pathname = usePathname();
   const searchParams = useSearchParams();

   const uniqueMenus = Array.from(new Map(menus.map((menu) => [menu.name.toLowerCase(), menu])).values());

   const handleCategoryClick = (menuName) => {
      const params = new URLSearchParams(searchParams.toString());

      const isSameCategory = selectedMenuName === menuName;

      if (isSameCategory) {
         params.delete('category');
      } else {
         params.set('category', menuName);
      }

      // Update React state
      setSelectedMenuName(isSameCategory ? null : menuName);

      // Update URL
      const query = params.toString();

      router.push(query ? `${pathname}?${query}` : pathname);
   };

   return (
      <section className="w-full min-w-0">
         {/* Carousel Area */}
         <div className="w-full min-w-0">
            {/* Heading */}
            <h2 className="text-[20px] font-[600] text-[#02060C]">Explore by category</h2>

            {/* Menu Carousel */}
            <div
               className="
      flex w-full min-w-0 items-start
      gap-[35px]
      overflow-x-auto
      scroll-smooth
      snap-x snap-proximity
      px-4 py-4 sm:px-6
      scrollbar-hide
      max-[900px]:gap-[25px]
      max-[610px]:gap-[18px]
      max-[610px]:px-4
      max-[380px]:gap-[12px]
      max-[380px]:px-3
   "
               style={{
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
               }}
            >
               {uniqueMenus.map((menu) => (
                  <div
                     key={menu.id}
                     onClick={() => handleCategoryClick(menu.name)}
                     className="
            group flex shrink-0 cursor-pointer
            snap-start
            flex-col items-center
            min-w-[95px]
            max-[610px]:min-w-[75px]
            max-[380px]:min-w-[65px]
         "
                  >
                     {/* Circle */}
                     <div
                        className={`h-[90px] w-[90px] rounded-full p-[4px] transition-all duration-200 group-hover:-translate-y-1 max-[610px]:h-[75px] max-[610px]:w-[75px] max-[380px]:h-[64px] max-[380px]:w-[64px] ${
                           selectedMenuName === menu.name ? 'bg-[#E56A77]' : 'bg-transparent'
                        }`}
                     >
                        <div className="h-full w-full rounded-full bg-white p-[3px]">
                           <img
                              src={menu.image_url || '/assets/pizza.jpg'}
                              alt={menu.name}
                              className="h-full w-full rounded-full object-cover"
                              draggable={false}
                           />
                        </div>
                     </div>

                     {/* Menu Name */}
                     <p
                        className={`mt-2 whitespace-nowrap text-[15px] font-[500] transition-all duration-200 group-hover:-translate-y-1 max-[610px]:text-[13px] max-[380px]:text-[12px] ${
                           selectedMenuName === menu.name ? 'text-[#E56A77]' : 'text-[#747474]'
                        }`}
                     >
                        {menu.name}
                     </p>
                  </div>
               ))}
            </div>
         </div>

         {/* Divider */}
         <div className="mt-4 w-full border-t border-[#E2E2E2]" />
      </section>
   );
}
