'use client'

import { useState, useTransition } from 'react'
import { deleteResolution } from '@/lib/actions/resolutions'

interface Props {
  resolutionId: string
}

export default function DeleteResolutionButton({ resolutionId }: Props) {
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    setError('')
    startTransition(async () => {
      try {
        await deleteResolution(resolutionId)
        setConfirming(false)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Delete failed')
        setConfirming(false)
      }
    })
  }

  if (confirming) {
    return (
      <span className="flex items-center gap-2">
        <span className="text-xs font-mono text-red-400/80">Delete permanently?</span>
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="text-xs font-mono text-red-400 hover:text-red-300 transition-colors disabled:opacity-40"
        >
          {isPending ? 'Deleting…' : 'Yes, delete'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          disabled={isPending}
          className="text-xs font-mono text-white/30 hover:text-white/60 transition-colors"
        >
          Cancel
        </button>
        {error && <span className="text-xs font-mono text-red-400">{error}</span>}
      </span>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="text-xs font-mono text-white/25 hover:text-red-400 transition-colors"
    >
      Delete
    </button>
  )
}
