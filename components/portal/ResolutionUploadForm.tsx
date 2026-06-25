'use client'

import { useState, useRef } from 'react'
import { uploadResolution } from '@/lib/actions/resolutions'
import type { Committee } from '@/data/committees'

interface Props {
  committees: Committee[]
  defaultSlug?: string
}

const VALID_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
const MAX_SIZE_MB = 10

export default function ResolutionUploadForm({ committees, defaultSlug }: Props) {
  const [committeeSlug, setCommitteeSlug] = useState(defaultSlug ?? committees[0]?.slug ?? '')
  const [title, setTitle] = useState('')
  const [resolutionCode, setResolutionCode] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError('')
    const selected = e.target.files?.[0]
    if (!selected) return

    if (selected.type !== VALID_MIME) {
      setFileError('Only .docx files are accepted')
      setFile(null)
      return
    }
    if (selected.size > MAX_SIZE_MB * 1024 * 1024) {
      setFileError(`File must be under ${MAX_SIZE_MB} MB`)
      setFile(null)
      return
    }
    setFile(selected)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!file) { setError('Please select a DOCX file'); return }
    if (!title.trim()) { setError('Resolution title is required'); return }
    if (!committeeSlug) { setError('Please select a committee'); return }

    setSubmitting(true)
    try {
      const fd = new FormData()
      fd.append('committeeSlug', committeeSlug)
      fd.append('title', title.trim())
      fd.append('resolutionCode', resolutionCode.trim())
      fd.append('file', file)

      await uploadResolution(fd)

      const committee = committees.find(c => c.slug === committeeSlug)
      setSuccess(`Resolution published for ${committee?.acronym ?? committeeSlug} at ${new Date().toLocaleString()}`)
      setTitle('')
      setResolutionCode('')
      setFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setSubmitting(false)
    }
  }

  const inputCls = 'w-full bg-white/[0.04] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#c9a84c]/40 transition-all'
  const labelCls = 'block text-xs font-mono text-white/40 mb-1.5 uppercase tracking-widest'

  return (
    <form onSubmit={handleSubmit} className="bg-white/[0.03] border border-white/10 rounded-xl p-6 space-y-5">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-1.5 h-5 rounded-full bg-[#c9a84c]/60" />
        <h2 className="text-sm font-mono font-semibold text-white/80 tracking-wider uppercase">
          Upload New Resolution
        </h2>
      </div>

      {/* Committee */}
      <div>
        <label className={labelCls}>Committee *</label>
        <select
          value={committeeSlug}
          onChange={e => setCommitteeSlug(e.target.value)}
          className={inputCls}
          disabled={!!defaultSlug}
        >
          {committees.map(c => (
            <option key={c.slug} value={c.slug}>{c.acronym} — {c.name}</option>
          ))}
        </select>
      </div>

      {/* Title */}
      <div>
        <label className={labelCls}>Resolution Title *</label>
        <input
          className={inputCls}
          placeholder="e.g. Resolution on Food Security"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        />
      </div>

      {/* Resolution Code */}
      <div>
        <label className={labelCls}>Resolution Code (optional)</label>
        <input
          className={inputCls}
          placeholder="e.g. GA4/1/2026"
          value={resolutionCode}
          onChange={e => setResolutionCode(e.target.value)}
        />
      </div>

      {/* File */}
      <div>
        <label className={labelCls}>DOCX File * (max {MAX_SIZE_MB} MB)</label>
        <input
          ref={fileInputRef}
          type="file"
          accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={handleFileChange}
          className="w-full text-sm text-white/60 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-mono file:bg-white/10 file:text-white/70 hover:file:bg-white/20 cursor-pointer"
        />
        {file && (
          <p className="text-xs font-mono text-emerald-400/70 mt-1.5">
            ✓ {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
          </p>
        )}
        {fileError && (
          <p className="text-xs font-mono text-red-400 mt-1.5">{fileError}</p>
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-sm text-red-400 font-mono">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-4 py-3 text-sm text-emerald-400 font-mono">
          ✓ {success}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full py-3 bg-[#c9a84c]/15 hover:bg-[#c9a84c]/25 border border-[#c9a84c]/30 hover:border-[#c9a84c]/50 rounded-lg text-sm font-semibold text-[#c9a84c] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {submitting ? 'Uploading…' : 'Publish Resolution →'}
      </button>
    </form>
  )
}
