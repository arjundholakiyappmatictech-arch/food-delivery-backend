export default function ExploreMenu({ menus = [], selectedMenuId, setSelectedMenuId }) {
   return (
      <section className="w-full">
         {/* Carousel Area */}
         <div className="w-full overflow-hidden">
            {/* Heading */}
            <h2 className="mb-3 text-[22px] font-[600] text-[#02060C] max-[610px]:text-[18px]">Explore by category</h2>

            {/* Menu Carousel */}
            <div
               className="flex items-start gap-[35px] overflow-x-auto scroll-smooth px-[10px] py-3 scrollbar-hide max-[900px]:gap-[25px] max-[610px]:gap-[20px]"
               style={{
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
               }}
            >
               {menus.map((menu) => (
                  <div
                     key={menu.id}
                     onClick={() => setSelectedMenuId(menu.id)}
                     className="group flex min-w-[95px] shrink-0 cursor-pointer flex-col items-center"
                  >
                     {/* Circle */}
                     <div
                        className={`h-[90px] w-[90px] rounded-full p-[4px] transition-all duration-200 group-hover:-translate-y-1 group-hover:scale-105 max-[610px]:h-[75px] max-[610px]:w-[75px] ${
                           selectedMenuId === menu.id ? 'bg-[#E56A77]' : 'bg-transparent'
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
                        className={`mt-2 whitespace-nowrap text-[15px] font-[500] transition-all duration-200 group-hover:-translate-y-1 max-[610px]:text-[13px] ${
                           selectedMenuId === menu.id ? 'text-[#E56A77]' : 'text-[#747474]'
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
