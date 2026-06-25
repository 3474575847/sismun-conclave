export type FloorResolution = {
  id: string
  status: string
  is_deleted: boolean
  submitted_at: string | null
  [key: string]: unknown
}

export type AmendmentLogEntry = {
  id: string
  timestamp: string
  [key: string]: unknown
}

/**
 * Sort amendment log entries by timestamp descending (most recent first).
 * Requirements: 8.6
 */
export function sortAmendmentLogDescending(entries: AmendmentLogEntry[]): AmendmentLogEntry[] {
  return [...entries].sort((a, b) => {
    const timeA = new Date(a.timestamp).getTime()
    const timeB = new Date(b.timestamp).getTime()
    return timeB - timeA  // descending
  })
}

/**
 * Filter and sort resolutions for floor display.
 * Returns only status='floor' and is_deleted=false rows,
 * ordered by submitted_at descending (nulls last).
 * Requirements: 5.1, 5.2
 */
export function filterFloorResolutions(resolutions: FloorResolution[]): FloorResolution[] {
  return resolutions
    .filter(r => r.status === 'floor' && !r.is_deleted)
    .sort((a, b) => {
      if (!a.submitted_at && !b.submitted_at) return 0
      if (!a.submitted_at) return 1   // nulls last
      if (!b.submitted_at) return -1
      // Use numeric Date comparison for robust ordering across all ISO timestamps
      const timeA = new Date(a.submitted_at).getTime()
      const timeB = new Date(b.submitted_at).getTime()
      return timeB - timeA  // descending: larger (later) timestamps first
    })
}
