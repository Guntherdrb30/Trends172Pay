import Link from "next/link";

export default function PaymentLayout({
    children
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center p-4">
            {/* Simple Payment Header */}
            <div className="w-full max-w-5xl flex justify-center py-6 mb-4">
                <Link href="/" className="inline-flex items-center hover:opacity-80 transition-opacity">
                    <span className="text-xl font-bold tracking-tight text-slate-100">
                        trends172 <span className="text-indigo-400">Pay</span>
                    </span>
                </Link>
            </div>

            <div className="w-full max-w-5xl flex justify-center">
                {children}
            </div>
        </div>
    );
}
