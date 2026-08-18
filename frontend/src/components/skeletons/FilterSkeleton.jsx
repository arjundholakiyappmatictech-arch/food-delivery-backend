export default function FilterSkeleton() {
   return (
      <div className="flex flex-wrap items-center justify-center gap-2 max-w-full overflow-x-auto py-1 scrollbar-hide">
         {Array.from({ length: 5 }).map((_, index) => (
            <div
               key={index}
               className="h-[35px] min-w-[100px] animate-pulse rounded-[0.6cm] bg-[#E9E9E9] max-[610px]:h-[27px] max-[610px]:min-w-[80px] shrink-0"
            />
         ))}
      </div>
   );
}
