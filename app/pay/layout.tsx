export default function PaymentLayout({
    children
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-5xl">
                {children}
            </div>
        </div>
    );
}
