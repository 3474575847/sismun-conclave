'use client'

import { useState } from 'react'
import { updateAmendmentStatus } from '@/lib/actions/amendments'
import type { Amendment } from '@/lib/actions/amendments'

interface ResolutionGroup {
  id: string
  title: string
  resolution_code: string | null
  amendments: Amendment[]
}

interface Props {
  groups: ResolutionGroup[]
}

const STATUS_STYLE: Record<string, string> = {
  pending: 'text-amber-600 dark:text-amber-400 border-amber-400/30 bg-amber-400/10',
  passed: 'text-emerald-600 dark:text-emerald-400 border-emerald-400/30 bg-emerald-400/10',
  failed: 'text-red-600 dark:text-red-400 border-red-400/30 bg-red-400/10',
  withdrawn: 'text-gray-400 dark:text-white/30 border-gray-300 dark:border-white/10 bg-gray-100 dark:bg-white/5',
}

const STATUS_ORDER: Record<string, number> = { pending: 0, passed: 1, failed: 2, withdrawn: 3 }

function AmendmentCard({ amendment }: { amendment: Amendment }) {
  const [status, setStatus] = useState(amendment.status)
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')

  const act = async (newStatus: 'passed' | 'failed' | 'withdrawn') => {
    setError('')
    setLoading(newStatus)
    try {
      await updateAmendmentStatus(amendment.id, newStatus)
      setStatus(newStatus)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Action failed')
    } finally {
      setLoading(null)
    }
  }

  const isPending = status === 'pending'

  return (
    <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/8 rounded-lg p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${STATUS_STYLE[status]}`}>
            {status.toUpperCase()}
          </span>
          {amendment.amendment_type && (
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
              amendment.amendment_type === 'modify'
                ? 'text-amber-600 dark:text-amber-400 border-amber-400/30 bg-amber-400/10'
                : amendment.amendment_type === 'strike'
                ? 'text-red-600 dark:text-red-400 border-red-400/30 bg-red-400/10'
                : 'text-emerald-600 dark:text-emerald-400 border-emerald-400/30 bg-emerald-400/10'
            }`}>
              {amendment.amendment_type === 'modify' ? '✎ MODIFY' : amendment.amendment_type === 'strike' ? '✕ STRIKE' : '+ ADD'}
            </span>
          )}
          <span className="text-[10px] font-mono text-gray-500 dark:text-white/40">{amendment.clause_reference}</span>
        </div>
        <span className="text-[11px] font-mono text-gray-400 dark:text-white/25 shrink-0">
          {new Date(amendment.created_at).toLocaleDateString()}
        </span>
      </div>

      <p className="text-sm text-gray-800 dark:text-white/80 leading-relaxed mb-3">{amendment.proposed_text}</p>

      <p className="text-[11px] font-mono text-gray-400 dark:text-white/35 mb-3">
        <span className="text-gray-600 dark:text-white/55">{amendment.delegate_name}</span>
        {' · '}
        <span className="text-gray-600 dark:text-white/55">{amendment.delegate_country}</span>
      </p>

      {isPending && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => act('passed')}
            disabled={!!loading}
            className="px-3 py-1.5 text-xs font-mono bg-emerald-400/10 hover:bg-emerald-400/20 border border-emerald-400/30 text-emerald-600 dark:text-emerald-400 rounded transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading === 'passed' ? '…' : '✓ Passed'}
          </button>
          <button
            onClick={() => act('failed')}
            disabled={!!loading}
            className="px-3 py-1.5 text-xs font-mono bg-red-400/10 hover:bg-red-400/20 border border-red-400/30 text-red-600 dark:text-red-400 rounded transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading === 'failed' ? '…' : '✕ Failed'}
          </button>
          <button
            onClick={() => act('withdrawn')}
            disabled={!!loading}
            className="px-3 py-1.5 text-xs font-mono bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-300 dark:border-white/10 text-gray-500 dark:text-white/40 rounded transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading === 'withdrawn' ? '…' : '— Withdrawn'}
          </button>
        </div>
      )}

      {error && (
        <p className="text-xs font-mono text-red-500 dark:text-red-400 mt-2">{error}</p>
      )}
    </div>
  )
}

export default function ChairAmendmentQueue({ groups }: Props) {
  if (groups.length === 0 || groups.every(g => g.amendments.length === 0)) {
    return (
      <div className="text-center py-24 bg-white/[0.02] border border-dashed border-white/8 rounded-xl">
        <div className="text-emerald-400/20 text-4xl mb-4 font-mono">✓</div>
        <p className="text-sm text-white/25 font-mono italic">No amendments to review.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {groups.map(group => {
        if (group.amendments.length === 0) return null

        const sorted = [...group.amendments].sort(
          (a, b) => (STATUS_ORDER[a.status] ?? 4) - (STATUS_ORDER[b.status] ?? 4)
        )
        const pendingCount = sorted.filter(a => a.status === 'pending').length

        return (
          <div key={group.id}>
            <div className="flex items-center gap-3 mb-4">
              {group.resolution_code && (
                <span className="text-[10px] font-mono text-[#c9a84c]/60 border border-[#c9a84c]/20 px-2 py-0.5 rounded">
                  {group.resolution_code}
                </span>
              )}
              <h3 className="text-sm font-semibold text-white">{group.title}</h3>
              {pendingCount > 0 && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-400 border border-amber-400/30">
                  {pendingCount} pending
                </span>
              )}
            </div>
            <div className="space-y-3">
              {sorted.map(a => (
                <AmendmentCard key={a.id} amendment={a} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
