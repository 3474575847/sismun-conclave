/**
 * Retrieves the committee access password from environment variables.
 * Passwords are stored server-side only as COMMITTEE_PASSWORD_<SLUG> env vars.
 * They are never derived from public data or stored in the database.
 *
 * Set these in .env.local (and your deployment environment):
 *   COMMITTEE_PASSWORD_GA4=...
 *   COMMITTEE_PASSWORD_SC=...
 *   etc.
 *
 * Never prefixed with NEXT_PUBLIC_ — server-only.
 */
export function getCommitteePassword(slug: string): string {
  const key = `COMMITTEE_PASSWORD_${slug.toUpperCase().replace(/-/g, '_')}`
  const password = process.env[key]
  if (!password) throw new Error(`Committee password not configured for: ${slug}`)
  return password
}

/**
 * Validates a submitted password against the expected committee password.
 * Both sides are lowercased and whitespace-stripped before comparison.
 */
export function validateCommitteePassword(slug: string, submitted: string): boolean {
  const expected = getCommitteePassword(slug)
  const normalized = submitted.toLowerCase().replace(/\s+/g, '')
  const expectedNormalized = expected.toLowerCase().replace(/\s+/g, '')
  return normalized === expectedNormalized
}
