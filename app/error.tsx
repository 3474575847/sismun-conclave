'use client'

import { useEffect } from 'react'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Next.js Error Boundary Caught:', error)
    }, [error])

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-charcoal text-platinum">
            <h2 className="text-4xl font-display font-bold mb-4">Something went wrong!</h2>
            <p className="mb-8 font-mono text-platinum/60">{error.message || 'An unexpected error occurred.'}</p>
            <button
                className="px-6 py-3 bg-gold text-charcoal font-bold rounded-lg hover:bg-gold/80 transition-colors"
                onClick={
                    // Attempt to recover by trying to re-render the segment
                    () => reset()
                }
            >
                Try again
            </button>
        </div>
    )
}
