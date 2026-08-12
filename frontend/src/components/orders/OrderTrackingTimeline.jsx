import { Check } from 'lucide-react';

const trackingSteps = [
   {
      key: 'placed',
      label: 'Order Placed',
   },
   {
      key: 'assigned',
      label: 'Delivery Partner Assigned',
   },
   {
      key: 'out_for_delivery',
      label: 'Out for Delivery',
   },
   {
      key: 'delivered',
      label: 'Delivered',
   },
];

const statusOrder = {
   placed: 0,
   assigned: 1,
   out_for_delivery: 2,
   delivered: 3,
};

export default function OrderTrackingTimeline({ order }) {
   const currentStep = statusOrder[order.status] ?? 0;

   return (
      <section className="rounded-2xl border border-[#E9E9E9] bg-white p-8 shadow-[0_4px_20px_rgba(0,0,0,0.04)] max-[800px]:p-5">
         {/* Desktop */}
         <div className="relative flex items-start justify-between max-[640px]:hidden">
            {/* Progress line */}
            <div className="absolute left-[12.5%] right-[12.5%] top-5 h-[2px] bg-[#E9E9E9]" />

            <div
               className="absolute left-[12.5%] top-5 h-[2px] bg-[#E56A77] transition-all duration-500"
               style={{
                  width: `${(currentStep / (trackingSteps.length - 1)) * 75}%`,
               }}
            />

            {trackingSteps.map((step, index) => {
               const isCompleted = index <= currentStep;
               const isCurrent = index === currentStep;

               return (
                  <div key={step.key} className="relative z-10 flex flex-1 flex-col items-center text-center">
                     <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                           isCompleted
                              ? 'border-[#E56A77] bg-[#E56A77] text-white'
                              : 'border-[#E9E9E9] bg-white text-gray-400'
                        } ${isCurrent ? 'ring-4 ring-[#fff1f3]' : ''}`}
                     >
                        {isCompleted ? (
                           <Check size={18} strokeWidth={2.5} />
                        ) : (
                           <span className="h-2 w-2 rounded-full bg-gray-300" />
                        )}
                     </div>

                     <p
                        className={`mt-4 max-w-[140px] text-sm leading-5 ${
                           isCompleted ? 'font-semibold text-[#02060C]' : 'font-medium text-gray-400'
                        }`}
                     >
                        {step.label}
                     </p>

                     {isCurrent && <span className="mt-1 text-xs font-medium text-[#E56A77]">Current</span>}

                     {step.key === 'delivered' && order.delivered_at && (
                        <span className="mt-1 text-xs text-gray-500">{formatDate(order.delivered_at)}</span>
                     )}
                  </div>
               );
            })}
         </div>

         {/* Mobile */}
         <div className="hidden space-y-5 max-[640px]:block">
            {trackingSteps.map((step, index) => {
               const isCompleted = index <= currentStep;
               const isCurrent = index === currentStep;
               const isLast = index === trackingSteps.length - 1;

               return (
                  <div key={step.key} className="flex items-start gap-4">
                     <div className="flex flex-col items-center">
                        <div
                           className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 ${
                              isCompleted
                                 ? 'border-[#E56A77] bg-[#E56A77] text-white'
                                 : 'border-[#E9E9E9] bg-white text-gray-400'
                           } ${isCurrent ? 'ring-4 ring-[#fff1f3]' : ''}`}
                        >
                           {isCompleted ? (
                              <Check size={17} strokeWidth={2.5} />
                           ) : (
                              <span className="h-2 w-2 rounded-full bg-gray-300" />
                           )}
                        </div>

                        {!isLast && (
                           <div
                              className={`mt-1 h-8 w-[2px] ${index < currentStep ? 'bg-[#E56A77]' : 'bg-[#E9E9E9]'}`}
                           />
                        )}
                     </div>

                     <div className="pt-1">
                        <p
                           className={`text-sm ${
                              isCompleted ? 'font-semibold text-[#02060C]' : 'font-medium text-gray-400'
                           }`}
                        >
                           {step.label}
                        </p>

                        {isCurrent && <p className="mt-1 text-xs font-medium text-[#E56A77]">Current status</p>}

                        {step.key === 'delivered' && order.delivered_at && (
                           <p className="mt-1 text-xs text-gray-500">{formatDate(order.delivered_at)}</p>
                        )}
                     </div>
                  </div>
               );
            })}
         </div>
      </section>
   );
}

function formatDate(date) {
   return new Date(date).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
   });
}
