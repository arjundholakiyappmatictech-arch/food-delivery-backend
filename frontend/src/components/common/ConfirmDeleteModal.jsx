'use client';

import { AlertCircle, Loader2 } from 'lucide-react';

export default function ConfirmDeleteModal({
   isOpen,
   title = 'Delete Item?',
   description,
   children,
   isDeleting = false,
   onConfirm,
   onCancel,
   confirmText = 'Delete',
   deletingText = 'Deleting...',
   cancelText = 'Cancel',
}) {
   if (!isOpen) return null;

   return (
      <div
         className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs"
         onClick={(e) => {
            if (e.target === e.currentTarget && !isDeleting) {
               onCancel();
            }
         }}
      >
         <div className="relative w-full max-w-sm rounded-2xl border border-[#E9E9E9] bg-white p-5 text-center shadow-xl">
            <div className="mx-auto flex size-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
               <AlertCircle className="size-5" />
            </div>

            <h3 className="mt-3 text-sm font-bold text-[#02060C]">{title}</h3>

            <p className="mt-1 text-xs leading-relaxed text-[#595959]">{description || children}</p>

            <div className="mt-4 flex items-center justify-center gap-2">
               <button
                  type="button"
                  disabled={isDeleting}
                  onClick={onCancel}
                  className="flex-1 cursor-pointer rounded-xl border border-[#E9E9E9] bg-white py-2 text-xs font-semibold text-[#595959] transition hover:bg-gray-50 disabled:opacity-50"
               >
                  {cancelText}
               </button>

               <button
                  type="button"
                  disabled={isDeleting}
                  onClick={onConfirm}
                  className="flex flex-1 cursor-pointer items-center justify-center gap-1 rounded-xl bg-red-600 py-2 text-xs font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
               >
                  {isDeleting ? (
                     <>
                        <Loader2 className="size-3 animate-spin" />
                        <span>{deletingText}</span>
                     </>
                  ) : (
                     confirmText
                  )}
               </button>
            </div>
         </div>
      </div>
   );
}
