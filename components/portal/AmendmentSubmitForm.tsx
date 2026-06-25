'use client'

import { useState, useEffect } from 'react'
import { proposeAmendment } from '@/lib/actions/amendments'

interface ResolutionOption {
  id: string
  title: string
  resolution_code: string | null
}

interface Props {
  resolutions: ResolutionOption[]
  committeeSlug: string
}

const SESSION_KEY = (slug: string) => `committee_password_${slug}`

export default function AmendmentSubmitForm({ resolutions, committeeSlug }: Props) {
  const [resolutionId, setResolutionId] = useState(resolutions[0]?.id ?? '')
  const [delegateName, setDelegateName] = useState('')
  const [delegateCountry, setDelegateCountry] = useState('')
  const [amendmentType, setAmendmentType] = useState<'modify' | 'strike' | 'add'>('modify')
  const [clauseReference, setClauseReference] = useState('')
  const [proposedText, setProposedText] = useState('')
  const [committeePassword, setCommitteePassword] = useState('')
  const [passwordSaved, setPasswordSaved] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Load saved password from sessionStorage on mount (one-time entry per session)
  useEffect(() => {
    const saved = sessionStorage.getItem(SESSION_KEY(committeeSlug))
    if (saved) {
      setCommitteePassword(saved)
      setPasswordSaved(true)
    }
  }, [committeeSlug])

  const inputCls = 'w-full bg-charcoal/5 dark:bg-white/[0.04] border border-charcoal/15 dark:border-white/10 rounded-lg px-4 py-2.5 text-sm text-charcoal dark:text-white placeholder-charcoal/30 dark:placeholder-white/25 focus:outline-none focus:border-school-red/40 dark:focus:border-[#c9a84c]/40 transition-all'
  const labelCls = 'block text-xs font-mono text-charcoal/50 dark:text-white/40 mb-1.5 uppercase tracking-widest'
  const cardCls = 'bg-charcoal/[0.03] dark:bg-white/[0.02] border border-charcoal/10 dark:border-white/8 rounded-xl p-6'
  const headingCls = 'text-sm font-semibold text-charcoal dark:text-white mb-4'

  if (resolutions.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed border-charcoal/15 dark:border-white/8 rounded-xl">
        <p className="text-sm text-charcoal/40 dark:text-white/30 font-mono">No active resolutions to amend.</p>
        <p className="text-xs text-charcoal/30 dark:text-white/20 mt-1">The Secretariat has not published any resolutions yet.</p>
      </div>
    )
  }

  if (success) {
    return (
      <div className="text-center py-16 px-6">
        <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-5">
          <span className="text-emerald-500 text-2xl">✓</span>
        </div>
        <h2 className="text-lg font-bold text-charcoal dark:text-white mb-2">Amendment Submitted</h2>
        <p className="text-sm text-charcoal/50 dark:text-white/40 mb-8">
          Your amendment has been submitted for EB review.
        </p>
        <button
          onClick={() => {
            setSuccess(false)
            setDelegateName('')
            setDelegateCountry('')
            setAmendmentType('modify')
            setClauseReference('')
            setProposedText('')
            setError('')
            // Keep password saved — don't clear it
          }}
          className="px-5 py-2 border border-charcoal/15 dark:border-white/10 rounded text-xs font-mono text-charcoal/60 dark:text-white/60 hover:text-charcoal dark:hover:text-white transition-all"
        >
          Submit Another
        </button>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!resolutionId) { setError('Please select a resolution'); return }
    if (!delegateName.trim()) { setError('Delegate name is required'); return }
    if (!delegateCountry.trim()) { setError('Country is required'); return }
    if (!amendmentType) { setError('Amendment type is required'); return }
    if (!clauseReference.trim()) { setError('Clause reference is required'); return }
    if (!proposedText.trim()) { setError('Proposed text is required'); return }
    if (!committeePassword.trim()) { setError('Committee password is required'); return }

    setSubmitting(true)
    try {
      await proposeAmendment({
        resolutionId,
        committeeSlug,
        delegateName,
        delegateCountry,
        amendmentType,
        clauseReference,
        proposedText,
        committeePassword,
      })
      // Save password to sessionStorage after first successful submission
      sessionStorage.setItem(SESSION_KEY(committeeSlug), committeePassword)
      setPasswordSaved(true)
      setSuccess(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Submission failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto" autoComplete="off">
      {/* Resolution selector */}
      <div className={cardCls}>
        <h2 className={headingCls}>Select Resolution</h2>
        <div>
          <label className={labelCls}>Resolution *</label>
          <select
            value={resolutionId}
            onChange={e => setResolutionId(e.target.value)}
            className={inputCls}
          >
            {resolutions.map(r => (
              <option key={r.id} value={r.id}>
                {r.resolution_code ? `[${r.resolution_code}] ` : ''}{r.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Delegate info */}
      <div className={cardCls}>
        <h2 className={headingCls}>Delegate Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Your Name *</label>
            <input
              className={inputCls}
              placeholder="e.g. Aryan Jindal"
              value={delegateName}
              onChange={e => setDelegateName(e.target.value)}
              autoComplete="name"
              required
            />
          </div>
          <div>
            <label className={labelCls}>Country *</label>
            <input
              className={inputCls}
              placeholder="e.g. India"
              value={delegateCountry}
              onChange={e => setDelegateCountry(e.target.value)}
              autoComplete="off"
              required
            />
          </div>
        </div>
      </div>

      {/* Amendment content */}
      <div className={cardCls}>
        <h2 className={headingCls}>Amendment Details</h2>
        <div className="space-y-4">
          {/* Amendment type */}
          <div>
            <label className={labelCls}>Amendment Type *</label>
            <div className="grid grid-cols-3 gap-2">
              {(['modify', 'strike', 'add'] as const).map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setAmendmentType(type)}
                  className={`py-2.5 rounded-lg text-xs font-mono uppercase tracking-widest border transition-all ${
                    amendmentType === type
                      ? type === 'modify'
                        ? 'bg-amber-400/15 border-amber-400/40 text-amber-600 dark:text-amber-400'
                        : type === 'strike'
                        ? 'bg-red-400/15 border-red-400/40 text-red-600 dark:text-red-400'
                        : 'bg-emerald-400/15 border-emerald-400/40 text-emerald-600 dark:text-emerald-400'
                      : 'bg-charcoal/[0.03] dark:bg-white/[0.03] border-charcoal/10 dark:border-white/10 text-charcoal/40 dark:text-white/30 hover:border-charcoal/20 dark:hover:border-white/20'
                  }`}
                >
                  {type === 'modify' ? '✎ Modify' : type === 'strike' ? '✕ Strike' : '+ Add'}
                </button>
              ))}
            </div>
            <p className="mt-1.5 text-[10px] font-mono text-charcoal/30 dark:text-white/25">
              {amendmentType === 'modify' && 'Change the wording of an existing clause'}
              {amendmentType === 'strike' && 'Remove an existing clause entirely'}
              {amendmentType === 'add' && 'Insert a new clause into the resolution'}
            </p>
          </div>
          <div>
            <label className={labelCls}>Clause Reference *</label>
            <input
              className={inputCls}
              placeholder="e.g. Operative Clause 3 or PP4"
              value={clauseReference}
              onChange={e => setClauseReference(e.target.value)}
              autoComplete="off"
              name="clause_reference_field"
              required
            />
          </div>
          <div>
            <label className={labelCls}>Proposed Text *</label>
            <textarea
              className={`${inputCls} resize-none`}
              rows={5}
              placeholder={
                amendmentType === 'strike'
                  ? 'Describe what should be removed...'
                  : amendmentType === 'add'
                  ? 'Enter the full text of the new clause...'
                  : 'Enter the revised wording for this clause...'
              }
              value={proposedText}
              onChange={e => setProposedText(e.target.value)}
              autoComplete="off"
              required
            />
          </div>
        </div>
      </div>

      {/* Password — only shown if not yet saved in session */}
      {!passwordSaved ? (
        <div className={cardCls}>
          <h2 className={headingCls}>Committee Access</h2>
          <p className="text-xs text-charcoal/40 dark:text-white/30 mb-4">
            Enter the access code provided by your Chair. It will be remembered for this session.
          </p>
          <div>
            <label className={labelCls}>Committee Password *</label>
            <input
              type="password"
              className={inputCls}
              placeholder="Enter your committee access code"
              value={committeePassword}
              onChange={e => setCommitteePassword(e.target.value)}
              autoComplete="new-password"
              required
            />
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 px-4 py-3 border border-emerald-500/20 bg-emerald-500/5 rounded-lg">
          <span className="text-emerald-500 text-sm">✓</span>
          <p className="text-xs font-mono text-charcoal/50 dark:text-white/40">
            Committee access verified for this session.
          </p>
          <button
            type="button"
            onClick={() => {
              sessionStorage.removeItem(SESSION_KEY(committeeSlug))
              setCommitteePassword('')
              setPasswordSaved(false)
            }}
            className="ml-auto text-[10px] font-mono text-charcoal/30 dark:text-white/25 hover:text-school-red transition-colors"
          >
            Reset
          </button>
        </div>
      )}

      {error && (
        <div className="border border-red-500/30 bg-red-500/5 rounded-lg px-4 py-3 text-sm text-red-600 dark:text-red-400 font-mono">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full py-3 bg-school-red/10 hover:bg-school-red/20 border border-school-red/30 hover:border-school-red/50 rounded-lg text-sm font-semibold text-school-red transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {submitting ? 'Submitting…' : 'Submit Amendment for EB Review →'}
      </button>
    </form>
  )
}
