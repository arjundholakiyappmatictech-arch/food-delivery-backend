export default function ExploreMenuSkeleton() {
   return (
      <section className="w-full animate-pulse">
         <div className="mt-5 h-[24px] w-[180px] rounded bg-[#E9E9E9]" />

         <div className="flex items-start gap-[35px] overflow-hidden px-[10px] py-3 max-[900px]:gap-[25px] max-[610px]:gap-[18px] max-[380px]:gap-[12px]">
            {Array.from({ length: 8 }).map((_, index) => (
               <div key={index} className="flex min-w-[95px] max-[610px]:min-w-[75px] max-[380px]:min-w-[65px] shrink-0 flex-col items-center">
                  <div className="h-[90px] w-[90px] rounded-full bg-[#E9E9E9] max-[610px]:h-[75px] max-[610px]:w-[75px] max-[380px]:h-[64px] max-[380px]:w-[64px]" />

                  <div className="mt-2 h-[16px] w-[65px] rounded bg-[#E9E9E9] max-[610px]:h-[14px] max-[380px]:h-[12px]" />
               </div>
            ))}
         </div>

         <div className="mt-4 w-full border-t border-[#E2E2E2]" />
      </section>
   );
}
