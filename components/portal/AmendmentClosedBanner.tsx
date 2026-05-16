interface AmendmentClosedBannerProps {
    message: string;
}

export default function AmendmentClosedBanner({ message }: AmendmentClosedBannerProps) {
    return (
        <div
            role="alert"
            className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/30 rounded-xl px-5 py-4 mb-6"
        >
            {/* Warning icon */}
            <span className="text-amber-400 text-lg leading-none mt-0.5 shrink-0" aria-hidden="true">
                ⚠
            </span>

            <div className="flex-1 min-w-0">
                <p className="text-xs font-mono font-semibold text-amber-400 uppercase tracking-widest mb-1">
                    Amendments Closed
                </p>
                <p className="text-sm font-mono text-amber-300/80 leading-relaxed">
                    {message}
                </p>
            </div>
        </div>
    );
}
