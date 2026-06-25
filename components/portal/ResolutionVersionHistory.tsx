'use client'

import { useState, useRef } from 'react'
import { republishResolution } from '@/lib/actions/resolutions'
import type { ResolutionFile } from '@/lib/actions/resolutions'

interface Props {
  resolutionId: string
  title: string
  files: ResolutionFile[]
  committeeSlug: string
}

const VALID_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

export default function ResolutionVersionHistory({ resolutionId, title, files, committeeSlug }: Props) {
  const [open, setOpen] = useState(false)
  const [reuploadOpen, setReuploadOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const sorted = [...files].sort((a, b) => b.version_number - a.version_number)
  const activeFile = sorted.find(f => f.status === 'active')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError('')
    const selected = e.target.files?.[0]
    if (!selected) return
    if (selected.type !== VALID_MIME) {
      setFileError('Only .docx files are accepted')
      setFile(null)
      return
    }
    if (selected.size > 10 * 1024 * 1024) {
      setFileError('File must be under 10 MB')
      setFile(null)
      return
    }
    setFile(selected)
  }

  const handleReupload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) { setError('Please select a DOCX file'); return }
    setSubmitting(true)
    setError('')
    setSuccess('')
    try {
      const fd = new FormData()
      fd.append('resolutionId', resolutionId)
      fd.append('file', file)
      await republishResolution(fd)
      setSuccess(`Re-uploaded at ${new Date().toLocaleString()}`)
      setFile(null)
      setReuploadOpen(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Re-upload failed')
    } finally {
      setSubmitting(false)
    }
  }

  const getPublicUrl = (path: string) => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    return `${supabaseUrl}/storage/v1/object/public/resolutions/${path}`
  }

  return (
    <div className="bg-white/[0.02] border border-white/8 rounded-xl overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/[0.03] transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
            activeFile
              ? 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10'
              : 'text-white/30 border-white/10'
          }`}>
            {activeFile ? 'LIVE' : 'ARCHIVED'}
          </span>
          <span className="text-sm font-semibold text-white/90">{title}</span>
        </div>
        <span className="text-white/30 text-xs font-mono">{open ? '▲' : '▼'} {files.length} version{files.length !== 1 ? 's' : ''}</span>
      </button>

      {open && (
        <div className="border-t border-white/8 px-5 py-4 space-y-3">
          {/* Version list */}
          {sorted.map(f => (
            <div key={f.id} className="flex items-center justify-between gap-4 py-2 border-b border-white/5 last:border-0">
              <div className="flex items-center gap-3 min-w-0">
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border shrink-0 ${
                  f.status === 'active'
                    ? 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10'
                    : 'text-white/25 border-white/10'
                }`}>
                  v{f.version_number}
                </span>
                <div className="min-w-0">
                  <p className="text-xs text-white/70 truncate">{f.file_name}</p>
                  <p className="text-[11px] text-white/30 font-mono">
                    {new Date(f.uploaded_at).toLocaleString()}
                    {f.status === 'archived' && ' · archived'}
                  </p>
                </div>
              </div>
              <a
                href={getPublicUrl(f.file_path)}
                download={f.file_name}
                className="shrink-0 text-xs font-mono text-[#c9a84c]/70 hover:text-[#c9a84c] border border-[#c9a84c]/20 hover:border-[#c9a84c]/40 px-3 py-1 rounded transition-all"
              >
                ↓ Download
              </a>
            </div>
          ))}

          {/* Re-upload section */}
          <div className="pt-2">
            <button
              onClick={() => setReuploadOpen(v => !v)}
              className="text-xs font-mono text-white/40 hover:text-white/70 border border-white/10 hover:border-white/20 px-3 py-1.5 rounded transition-all"
            >
              {reuploadOpen ? '✕ Cancel' : '↑ Upload Updated Version'}
            </button>

            {reuploadOpen && (
              <form onSubmit={handleReupload} className="mt-3 space-y-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleFileChange}
                  className="w-full text-sm text-white/60 file:mr-4 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-mono file:bg-white/10 file:text-white/70 hover:file:bg-white/20 cursor-pointer"
                />
                {file && <p className="text-xs font-mono text-emerald-400/70">✓ {file.name}</p>}
                {fileError && <p className="text-xs font-mono text-red-400">{fileError}</p>}
                {error && <p className="text-xs font-mono text-red-400">{error}</p>}
                {success && <p className="text-xs font-mono text-emerald-400">{success}</p>}
                <button
                  type="submit"
                  disabled={submitting || !file}
                  className="px-4 py-2 bg-[#c9a84c]/15 hover:bg-[#c9a84c]/25 border border-[#c9a84c]/30 rounded text-xs font-mono text-[#c9a84c] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Uploading…' : 'Publish New Version'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
