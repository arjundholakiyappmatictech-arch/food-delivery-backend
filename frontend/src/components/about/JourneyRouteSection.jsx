'use client';

export default function JourneyRouteSection({ creativeFontClass }) {
   const journeySteps = [
      {
         year: '2021',
         title: 'The Seed is Planted',
         description: 'A small idea to connect neighborhood food lovers with hidden culinary gems. We delivered our very first order with a single bike and a whole lot of passion.',
         align: 'left',
      },
      {
         year: '2023',
         title: 'Rapid Expansion',
         description: 'Word spread fast. We expanded to over 50 cities, partnering with thousands of top-rated local kitchens to bring diverse cuisines to hungry homes.',
         align: 'right',
      },
      {
         year: 'Today',
         title: 'Millions of Cravings',
         description: 'Tomato is now a daily ritual for millions. With smart routing, piping-hot deliveries, and a customer-first philosophy, we turn every meal into a celebration.',
         align: 'left',
      },
   ];

   return (
      <section className="bg-white py-24 min-h-[85vh] flex flex-col justify-center overflow-hidden max-[800px]:py-16 max-[560px]:py-12 relative">
         {/* Subtle background texture/glow */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(ellipse_at_center,_#E56A7710_0%,_transparent_70%)] pointer-events-none" />

         <div className="relative z-10 mx-auto w-full max-w-[1800px] px-[60px] max-[1200px]:px-[40px] max-[800px]:px-[25px] max-[560px]:px-[15px]">
            
            {/* Section Header */}
            <div className="flex flex-col items-center text-center mb-32 max-[800px]:mb-20">
               <span className="text-[12px] font-[700] tracking-[0.3em] text-[#E56A77] uppercase mb-4 opacity-80">
                  The Timeline
               </span>
               <h2 className={`text-[64px] text-[#02060C] max-[800px]:text-[48px] max-[560px]:text-[40px] ${creativeFontClass}`}>
                  Our Journey
               </h2>
               <div className="mt-6 text-[18px] font-[400] text-[#5F5F5F] max-w-2xl leading-relaxed max-[800px]:text-[16px]">
                  Tracing our path from a simple neighborhood idea to delivering happiness across the map.
               </div>
            </div>

            {/* Pin Route Timeline Container */}
            <div className="relative mx-auto max-w-5xl">
               
               <div className="flex flex-col">
                  {journeySteps.map((step, idx) => {
                     const isLeft = step.align === 'left';
                     const isLast = idx === journeySteps.length - 1;
                     
                     return (
                        <div key={idx} className="relative flex w-full items-stretch justify-center max-[800px]:flex-col max-[800px]:items-start group">
                           
                           {/* Desktop Left Spacer / Content */}
                           <div className={`w-1/2 flex max-[800px]:w-full max-[800px]:pl-16 relative z-10 ${isLeft ? 'justify-end pr-20 max-[1000px]:pr-12 max-[800px]:pr-0 max-[800px]:justify-start' : 'max-[800px]:order-last'}`}>
                              {isLeft && (
                                 <div className="w-full max-w-[420px] my-10 max-[800px]:my-6 transition-transform duration-500 ease-out group-hover:-translate-y-2">
                                    <span className="inline-block text-[16px] font-[700] text-[#E56A77] tracking-wider mb-2">
                                       {step.year}
                                    </span>
                                    <h3 className="mt-1 text-[32px] font-[700] text-[#02060C] tracking-tight max-[800px]:text-[28px]">
                                       {step.title}
                                    </h3>
                                    <p className="mt-4 text-[18px] font-[400] text-[#5F5F5F] leading-relaxed max-[800px]:text-[16px]">
                                       {step.description}
                                    </p>
                                 </div>
                              )}
                           </div>

                           {/* Central Axis & Pins */}
                           <div className="absolute left-1/2 top-0 bottom-0 flex flex-col items-center -translate-x-1/2 max-[800px]:left-6 max-[800px]:-translate-x-0 w-24 max-[800px]:w-12 pointer-events-none">
                              
                              {/* The Living Pin */}
                              <div className="relative mt-12 max-[800px]:mt-8">
                                 {/* Pulsing ring */}
                                 <div className="absolute inset-0 rounded-full bg-[#E56A77] animate-ping opacity-20" />
                                 <div className="flex h-12 w-12 max-[800px]:h-8 max-[800px]:w-8 shrink-0 items-center justify-center rounded-full bg-white border-[3px] border-[#E56A77] shadow-[0_0_20px_rgba(229,106,119,0.3)] z-20 relative transition-transform duration-300 group-hover:scale-110">
                                    <div className="h-4 w-4 max-[800px]:h-2.5 max-[800px]:w-2.5 rounded-full bg-[#E56A77]" />
                                 </div>
                              </div>

                              {/* Elegant Curved SVG Line to the next pin */}
                              {!isLast && (
                                 <div className="flex-1 w-[200px] max-[800px]:w-[2px] relative -mt-6 -mb-6 z-10 max-[800px]:bg-gradient-to-b max-[800px]:from-[#E56A77] max-[800px]:to-[#E56A77]/20">
                                    {/* Desktop Curved SVG */}
                                    <svg className="w-full h-full absolute inset-0 text-[#E56A77]/30 max-[800px]:hidden" viewBox="0 0 100 100" preserveAspectRatio="none">
                                       {isLeft ? (
                                          // Smooth S-Curve to the right
                                          <path d="M 50 0 C 130 25, 130 75, 50 100" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="6 6" vectorEffect="non-scaling-stroke" />
                                       ) : (
                                          // Smooth S-Curve to the left
                                          <path d="M 50 0 C -30 25, -30 75, 50 100" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="6 6" vectorEffect="non-scaling-stroke" />
                                       )}
                                    </svg>
                                 </div>
                              )}
                           </div>

                           {/* Desktop Right Spacer / Content */}
                           <div className={`w-1/2 flex max-[800px]:w-full max-[800px]:pl-16 relative z-10 ${!isLeft ? 'justify-start pl-20 max-[1000px]:pl-12 max-[800px]:pl-0 max-[800px]:justify-start' : 'max-[800px]:hidden'}`}>
                              {!isLeft && (
                                 <div className="w-full max-w-[420px] my-10 max-[800px]:my-6 transition-transform duration-500 ease-out group-hover:-translate-y-2">
                                    <span className="inline-block text-[16px] font-[700] text-[#E56A77] tracking-wider mb-2">
                                       {step.year}
                                    </span>
                                    <h3 className="mt-1 text-[32px] font-[700] text-[#02060C] tracking-tight max-[800px]:text-[28px]">
                                       {step.title}
                                    </h3>
                                    <p className="mt-4 text-[18px] font-[400] text-[#5F5F5F] leading-relaxed max-[800px]:text-[16px]">
                                       {step.description}
                                    </p>
                                 </div>
                              )}
                           </div>

                        </div>
                     );
                  })}
               </div>
               
            </div>

         </div>
      </section>
   );
}
