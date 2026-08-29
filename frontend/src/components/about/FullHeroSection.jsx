/* eslint-disable @next/next/no-img-element */
'use client';

export default function FullHeroSection({ creativeFontClass }) {
   return (
      <section className="relative w-full min-h-[85vh] flex flex-col justify-center items-center bg-black overflow-hidden group">
         <div className="absolute inset-0 w-full h-full transition-transform duration-[20s] ease-out group-hover:scale-105">
            <img
               src="/assets/about_hero_v3.png"
               alt="Beautiful high-end food delivery dining"
               className="h-full w-full object-cover opacity-90"
               draggable={false}
               loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#02060C] via-[#02060C]/40 to-[#02060C]/80" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-black/20 via-transparent to-[#02060C]/60" />
         </div>

         <div className="relative z-10 mx-auto flex w-full max-w-[1800px] flex-col items-center text-center px-[60px] max-[1200px]:px-[40px] max-[800px]:px-[25px] max-[560px]:px-[15px] pt-10">
            <div className="flex flex-col items-center justify-center max-w-4xl">
               <h1 className={`text-[110px] font-bold text-white tracking-tight drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] max-[1200px]:text-[90px] max-[800px]:text-[72px] max-[560px]:text-[56px] ${creativeFontClass}`}>
                  Tomato
               </h1>

               <h2 className={`mt-4 text-[48px] leading-tight text-[#FFD1D6] drop-shadow-[0_10px_20px_rgba(0,0,0,0.9)] max-[1200px]:text-[42px] max-[800px]:text-[32px] max-[560px]:text-[28px] ${creativeFontClass}`}>
                  &ldquo;Good food brings people together, turning everyday moments into cherished memories, one craving at a time.&rdquo;
               </h2>

               <div className="mt-10 mb-10 flex items-center justify-center gap-6 opacity-80">
                  <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-white to-transparent" />
                  <div className="h-2 w-2 rounded-full bg-[#E56A77] shadow-[0_0_10px_#E56A77]" />
                  <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-white to-transparent" />
               </div>

               <p className="max-w-3xl mb-5 text-[20px] font-[400] text-gray-200/90 leading-relaxed tracking-wide max-[800px]:text-[16px] max-[560px]:text-[14px] drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]">
                  We are a modern food-tech platform dedicated to making culinary experiences effortlessly accessible. We bridge the gap between passionate local chefs, hidden cloud kitchens, and hungry food lovers—delivering joy straight to your door.
               </p>
            </div>
         </div>

      </section>
   );
}
