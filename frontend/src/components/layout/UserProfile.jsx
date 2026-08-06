'use client';

import { useEffect, useRef, useState } from 'react';

export function UserProfile() {
   const [isProfileOpen, setIsProfileOpen] = useState(false);

   // Replace these later with your actual user data
   const user = {
      name: 'John Doe',
      email: 'john@example.com',
      picture: '/assets/avatar.png',
   };

   const profileRef = useRef(null);
   const buttonRef = useRef(null);

   useEffect(() => {
      const handleOutsideClick = (e) => {
         if (
            profileRef.current &&
            !profileRef.current.contains(e.target) &&
            buttonRef.current &&
            !buttonRef.current.contains(e.target)
         ) {
            setIsProfileOpen(false);
         }
      };

      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);

      return () => {
         document.removeEventListener('mousedown', handleOutsideClick);
         document.removeEventListener('touchstart', handleOutsideClick);
      };
   }, []);

   return (
      <div className="profile w-[50px] h-[50px] rounded-full m-auto max-[700px]:w-[40px] max-[700px]:h-[40px] max-[500px]:w-[30px] max-[500px]:h-[30px]">
         <img
            ref={buttonRef}
            src={user.picture}
            alt="profile"
            className="w-full h-full object-cover overflow-hidden rounded-full border border-[#E9E9E9] cursor-pointer"
            draggable="false"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
         />

         {isProfileOpen && (
            <div
               ref={profileRef}
               className="absolute top-[85px] right-[10px] z-10 bg-[#F0F8FF] border border-[#E9E9E9] rounded-[0.2cm] max-[610px]:top-[70px]"
            >
               <div className="w-[400px] h-[300px] flex flex-col items-center justify-center max-[600px]:w-[300px] max-[600px]:h-[220px]">
                  <img
                     src={user.picture}
                     alt="profile"
                     className="w-[100px] h-[100px] object-cover rounded-full bg-white border border-[#E9E9E9] max-[600px]:w-[75px] max-[600px]:h-[75px]"
                     draggable="false"
                  />

                  <p className="text-[20px] text-[#02060CEB] font-[500] mt-[10px] max-[600px]:text-[15px]">
                     Name: <span>{user.name}</span>
                  </p>

                  <p className="text-[15px] text-[#02060CEB] font-[500] my-[10px] max-[600px]:text-[10px]">
                     Email: <span>{user.email}</span>
                  </p>

                  <button className="mt-3 rounded-[0.2cm] bg-[#FC8019] px-6 py-2 text-white font-[600] hover:opacity-90 transition">
                     Logout
                  </button>
               </div>
            </div>
         )}
      </div>
   );
}
