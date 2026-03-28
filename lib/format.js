/**
 * Shared helpers used by both API routes and React components.
 * No Node-only or browser-only imports allowed here.
 */

/** Canonical title — exact format required by the business. */
export function formatTitle(inst) {
  const name  = inst.contactName  || 'Unknown'
  const veh   = inst.vehicle      || 'Unknown'
  const pkg   = inst.package      || 'Unknown'
  const stock = inst.stockNumber  || 'N/A'
  return `Install - ${name} - ${veh} - ${pkg} - ${stock}`
}

/**
 * Full output block — exact format, do not change.
 *
 * Install - [Contact Name] - [Vehicle] - [Package] - [Stock Number]
 * Date: YYYY-MM-DD
 * Notes: ...
 * Contact: ...
 * Vehicle: ...
 * Package: ...
 * Stock: ...
 */
export function formatOutput(inst) {
  return [
    formatTitle(inst),
    `Date: ${inst.date     || 'TBD'}`,
    `Notes: ${inst.notes  || ''}`,
    `Contact: ${inst.contactName  || ''}`,
    `Vehicle: ${inst.vehicle      || ''}`,
    `Package: ${inst.package      || ''}`,
    `Stock: ${inst.stockNumber    || ''}`,
  ].join('\n')
}

/** YYYY-MM-DD → "Mon, Jan 6, 2025" */
export function formatDate(dateStr) {
  if (!dateStr) return 'No date'
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
  })
}

/** Today as YYYY-MM-DD in local time. */
export function todayStr() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
