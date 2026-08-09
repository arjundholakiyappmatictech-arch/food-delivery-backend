export default function RestaurantSkeleton() {
   return (
      <div className="mx-auto w-[250px] animate-pulse rounded-[0.3cm] bg-white max-[1000px]:w-[220px] max-[800px]:w-[32vw] max-[560px]:w-[47vw]">
         <div className="h-[165px] w-full overflow-hidden rounded-[0.3cm] bg-[#E9E9E9]">
            <div className="h-full w-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
         </div>

         <div className="m-[5px] space-y-2 max-[560px]:m-[2px]">
            <div className="h-[21px] w-[70%] rounded bg-[#E9E9E9]" />

            <div className="h-[18px] w-[50%] rounded bg-[#E9E9E9]" />

            <div className="h-[16px] w-[85%] rounded bg-[#E9E9E9]" />

            <div className="h-[14px] w-[65%] rounded bg-[#E9E9E9]" />
         </div>
      </div>
   );
}
