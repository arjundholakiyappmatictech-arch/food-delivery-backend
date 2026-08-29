export default function RestaurantMenuSkeleton() {
   return (
      <div className="mx-auto mt-[30px] w-[800px] max-[820px]:mt-[10px] max-[820px]:w-[98%]">
         <div className="flex rounded-[0.3cm] border border-[#E9E9E9] shadow-[3px_3px_10px_#E9E9E9]">
            <div className="m-[20px] h-[175px] w-[175px] animate-pulse rounded-[0.3cm] bg-[#E5E5E5] max-[600px]:m-[10px] max-[600px]:h-[125px] max-[600px]:w-[125px]" />

            <div className="my-[20px] flex flex-1 flex-col max-[600px]:my-[12px]">
               <div className="mb-4 h-8 w-56 animate-pulse rounded bg-[#E5E5E5]" />

               <div className="mb-3 h-5 w-40 animate-pulse rounded bg-[#E5E5E5]" />

               <div className="mb-3 h-4 w-60 animate-pulse rounded bg-[#E5E5E5]" />

               <div className="mb-3 h-4 w-52 animate-pulse rounded bg-[#E5E5E5]" />

               <div className="h-4 w-28 animate-pulse rounded bg-[#E5E5E5]" />
            </div>
         </div>

         <div className="my-[25px] flex justify-center">
            <div className="h-7 w-28 animate-pulse rounded bg-[#E5E5E5]" />
         </div>

         {[1, 2, 3].map((category) => (
            <div key={category} className="mb-[30px] rounded-[0.3cm] shadow-[0px_3px_3px_#EBEBEB]">
               <div className="flex items-center justify-between p-[15px]">
                  <div className="h-6 w-48 animate-pulse rounded bg-[#E5E5E5]" />

                  <div className="h-5 w-5 animate-pulse rounded-full bg-[#E5E5E5]" />
               </div>

               {[1, 2].map((item) => (
                  <div key={item} className="flex justify-between px-[20px] py-[15px]">
                     <div className="flex-1">
                        <div className="mb-3 h-5 w-48 animate-pulse rounded bg-[#E5E5E5]" />

                        <div className="mb-3 h-4 w-20 animate-pulse rounded bg-[#E5E5E5]" />

                        <div className="mb-3 h-4 w-16 animate-pulse rounded bg-[#E5E5E5]" />

                        <div className="h-4 w-[90%] animate-pulse rounded bg-[#E5E5E5]" />
                     </div>

                     <div className="relative">
                        <div className="h-[135px] w-[156px] animate-pulse rounded-[0.3cm] bg-[#E5E5E5] max-[600px]:h-[100px] max-[600px]:w-[28vw]" />

                        <div className="absolute bottom-[-3px] left-[18px] h-10 w-[120px] animate-pulse rounded-[0.2cm] bg-[#F3F4F6] shadow-[0px_5px_10px_#E9E9E9]" />
                     </div>
                  </div>
               ))}
            </div>
         ))}
      </div>
   );
}
