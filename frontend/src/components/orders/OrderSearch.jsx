import { Search, X } from 'lucide-react';

export default function OrderSearch({ value, onChange }) {
    const handleClear = () => {
        onChange('');
    };

    return (
        <div className="relative mt-5">
            <Search
                className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#8C8C8C]"
                aria-hidden="true"
            />

            <input
                type="text"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder="Search restaurant or ordered items..."
                aria-label="Search orders"
                className="
               w-full
               rounded-xl
               border
               border-[#E9E9E9]
               bg-white
               py-3
               pl-11
               pr-11
               text-sm
               text-[#02060C]
               outline-none
               transition
               placeholder:text-[#A6A6A6]
               focus:border-[#E56A77]
               focus:ring-1
               focus:ring-[#E56A77]/20
            "
            />

            {value && (
                <button
                    type="button"
                    onClick={handleClear}
                    aria-label="Clear order search"
                    className="
                  absolute
                  right-3
                  top-1/2
                  flex
                  size-7
                  -translate-y-1/2
                  cursor-pointer
                  items-center
                  justify-center
                  rounded-full
                  text-[#8C8C8C]
                  transition
                  hover:bg-[#F5F5F5]
                  hover:text-[#02060C]
               "
                >
                    <X className="size-4" />
                </button>
            )}
        </div>
    );
}