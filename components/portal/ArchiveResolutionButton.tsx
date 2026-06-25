'use client'

import { useState, useTransition } from 'react'
import { archiveResolution } from '@/lib/actions/resolutions'

interface Props {
  resolutionId: string
}

export default function ArchiveResolutionButton({ resolutionId }: Props) {
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  const handleArchive = () => {
    setError('')
    startTransition(async () => {
      try {
        await archiveResolution(resolutionId)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Archive failed')
      }
    })
  }

  return (
    <div className="inline-flex items-center gap-2">
      <button
        onClick={handleArchive}
        disabled={isPending}
        className="text-xs font-mono text-white/25 hover:text-amber-400 transition-colors disabled:opacity-40"
      >
        {isPending ? 'Archiving…' : 'Archive'}
      </button>
      {error && <span className="text-xs font-mono text-red-400">{error}</span>}
    </div>
  )
}
