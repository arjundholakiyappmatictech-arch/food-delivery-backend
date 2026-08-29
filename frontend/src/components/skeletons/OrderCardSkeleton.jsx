export default function OrderCardSkeleton({ count = 2 }) {
    return (
        <div className="space-y-5">
            {Array.from({ length: count }).map((_, index) => (
                <article
                    key={index}
                    className="animate-pulse rounded-2xl border border-[#E9E9E9] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.04)]"
                >
                    <div className="flex items-center gap-5 p-6">
                        <div className="h-20 w-20 shrink-0 rounded-full bg-gray-200" />

                        <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-4">
                                <div className="h-5 w-48 max-w-[65%] rounded bg-gray-200" />
                                <div className="h-4 w-12 shrink-0 rounded bg-gray-200" />
                            </div>

                            <div className="mt-3 h-4 w-56 max-w-[75%] rounded bg-gray-200" />
                        </div>
                    </div>

                    <div className="border-t border-[#E9E9E9]" />

                    <div className="space-y-4 px-6 py-5">
                        <div className="flex items-center justify-between gap-4">
                            <div className="h-4 w-48 max-w-[65%] rounded bg-gray-200" />
                            <div className="h-4 w-16 rounded bg-gray-200" />
                        </div>

                        <div className="flex items-center justify-between gap-4">
                            <div className="h-4 w-40 max-w-[60%] rounded bg-gray-200" />
                            <div className="h-4 w-16 rounded bg-gray-200" />
                        </div>

                        <div className="h-4 w-28 rounded bg-gray-200" />
                    </div>

                    <div className="border-t border-[#E9E9E9]" />

                    <div className="flex items-center justify-between gap-6 px-6 py-5">
                        <div>
                            <div className="h-3 w-20 rounded bg-gray-200" />
                            <div className="mt-2 h-4 w-32 rounded bg-gray-200" />
                        </div>

                        <div>
                            <div className="h-3 w-24 rounded bg-gray-200" />
                            <div className="mt-2 h-4 w-28 rounded bg-gray-200" />
                        </div>

                        <div className="text-right">
                            <div className="ml-auto h-3 w-10 rounded bg-gray-200" />
                            <div className="mt-2 ml-auto h-5 w-20 rounded bg-gray-200" />
                        </div>
                    </div>

                    <div className="border-t border-[#E9E9E9]" />

                    <div className="flex items-center justify-end px-3 py-4">
                        <div className="h-10 w-32 rounded-xl bg-gray-200" />
                    </div>
                </article>
            ))}
        </div>
    );
}