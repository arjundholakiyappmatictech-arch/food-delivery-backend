export default function ReviewSkeleton({ count = 2 }) {
   return (
      <div className="space-y-4">
         {Array.from({ length: count }).map((_, i) => (
            <div
               key={i}
               className="animate-pulse rounded-xl border border-[#E9E9E9] bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
            >
               {/* Restaurant Header */}
               <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                     {/* Restaurant Image */}
                     <div className="h-12 w-12 shrink-0 rounded-lg bg-gray-200" />

                     {/* Restaurant Info */}
                     <div className="min-w-0 flex-1 space-y-2">
                        {/* Restaurant Name */}
                        <div className="h-3.5 w-40 max-w-[75%] rounded bg-gray-200" />

                        {/* Location */}
                        <div className="h-3 w-32 max-w-[60%] rounded bg-gray-200" />
                     </div>
                  </div>

                  {/* Delete Icon */}
                  <div className="h-6 w-6 shrink-0 rounded-lg bg-gray-200" />
               </div>

               {/* Order Information */}
               <div className="mt-4 rounded-lg bg-[#F8F8F8] px-3 py-2.5">
                  <div className="flex items-center justify-between gap-2">
                     {/* Order ID */}
                     <div className="h-3 w-24 rounded bg-gray-200" />

                     {/* Item Count */}
                     <div className="h-2.5 w-12 rounded bg-gray-200" />
                  </div>

                  {/* Ordered Items */}
                  <div className="mt-2 h-3 w-3/4 rounded bg-gray-200" />
               </div>

               {/* Rating */}
               <div className="mt-4 flex items-center gap-1.5">
                  <div className="flex gap-1">
                     <div className="h-3.5 w-3.5 rounded bg-gray-200" />
                     <div className="h-3.5 w-3.5 rounded bg-gray-200" />
                     <div className="h-3.5 w-3.5 rounded bg-gray-200" />
                     <div className="h-3.5 w-3.5 rounded bg-gray-200" />
                     <div className="h-3.5 w-3.5 rounded bg-gray-200" />
                  </div>

                  <div className="h-3 w-7 rounded bg-gray-200" />
               </div>

               {/* Comment */}
               <div className="mt-3 space-y-2">
                  <div className="h-3 w-full rounded bg-gray-200" />
                  <div className="h-3 w-2/3 rounded bg-gray-200" />
               </div>

               {/* Date */}
               <div className="mt-4 flex justify-end border-t border-[#F1F1F1] pt-2">
                  <div className="h-2.5 w-16 rounded bg-gray-200" />
               </div>
            </div>
         ))}
      </div>
   );
}
