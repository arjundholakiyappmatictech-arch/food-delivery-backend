import Image from 'next/image';

export function UserProfile() {
   return (
      <div className="relative">
         <button
            type="button"
            className="h-[50px] w-[50px] overflow-hidden rounded-full border border-[#E9E9E9] bg-[#F2F2F2] max-[700px]:h-[40px] max-[700px]:w-[40px] max-[500px]:h-[34px] max-[500px]:w-[34px]"
            aria-label="Open profile"
         >
            <Image
               src="/assets/avatar.png"
               alt="User profile"
               width={50}
               height={50}
               className="h-full w-full object-cover"
            />
         </button>
      </div>
   );
}
