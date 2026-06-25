import type { Amendment } from '@/lib/actions/amendments'

interface Props {
  amendments: Amendment[]
}

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pending',
  passed: 'Passed',
  failed: 'Failed',
  withdrawn: 'Withdrawn',
}

const STATUS_STYLE: Record<string, string> = {
  pending: 'text-amber-400 border-amber-400/30 bg-amber-400/10',
  passed: 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10',
  failed: 'text-red-400 border-red-400/30 bg-red-400/10',
  withdrawn: 'text-white/30 border-white/10 bg-white/5',
}

const STATUS_ORDER: Record<string, number> = {
  passed: 0,
  pending: 1,
  failed: 2,
  withdrawn: 3,
}

export default function AmendmentStatusList({ amendments }: Props) {
  if (amendments.length === 0) {
    return (
      <p className="text-xs text-white/25 font-mono italic py-3">
        No amendments submitted yet.
      </p>
    )
  }

  const sorted = [...amendments].sort(
    (a, b) => (STATUS_ORDER[a.status] ?? 4) - (STATUS_ORDER[b.status] ?? 4)
  )

  return (
    <div className="space-y-2 mt-3">
      {sorted.map(amendment => (
        <div
          key={amendment.id}
          className="bg-white/[0.02] border border-white/8 rounded-lg p-4"
        >
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${STATUS_STYLE[amendment.status]}`}>
                {STATUS_LABEL[amendment.status] ?? amendment.status}
              </span>
              <span className="text-[10px] font-mono text-white/40">
                {amendment.clause_reference}
              </span>
            </div>
            <span className="text-[11px] font-mono text-white/25 shrink-0">
              {new Date(amendment.created_at).toLocaleDateString()}
            </span>
          </div>

          <p className="text-sm text-white/70 leading-relaxed mb-2">
            {amendment.proposed_text}
          </p>

          <p className="text-[11px] font-mono text-white/30">
            Proposed by{' '}
            <span className="text-white/50">{amendment.delegate_name}</span>
            {' · '}
            <span className="text-white/50">{amendment.delegate_country}</span>
          </p>
        </div>
      ))}
    </div>
  )
}
