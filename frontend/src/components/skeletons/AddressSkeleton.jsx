export default function AddressSkeleton({ count = 2 }) {
   return (
      <div className="space-y-2 py-2">
         {Array.from({ length: count }).map((_, i) => (
            <div
               key={i}
               className="flex animate-pulse items-center gap-3 rounded-xl border border-[#E9E9E9] p-3"
            >
               <div className="size-8.5 rounded-lg bg-gray-200" />
               <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 w-24 rounded bg-gray-200" />
                  <div className="h-3 w-44 rounded bg-gray-100" />
               </div>
            </div>
         ))}
      </div>
   );
}
