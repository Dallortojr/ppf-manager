'use client'

import { useState } from 'react'
import { todayStr } from '@/lib/format'

export default function InstallRow({ install, onEdit, onDelete }) {
  const [confirming, setConfirming] = useState(false)

  const isPast = install.date && install.date < todayStr()

  // Parse date for the badge
  let dbMonth = '', dbDay = ''
  if (install.date) {
    const d = new Date(install.date + 'T12:00:00')
    dbMonth = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
    dbDay   = d.getDate()
  }

  const handleDeleteTap = e => {
    e.stopPropagation()
    if (confirming) {
      onDelete()
    } else {
      setConfirming(true)
      setTimeout(() => setConfirming(false), 3000)
    }
  }

  return (
    <div className="install-row fade-in" style={{ opacity: isPast ? 0.65 : 1 }}>

      {/* Date badge */}
      <div className="date-badge">
        {install.date ? (
          <>
            <div className="db-month">{dbMonth}</div>
            <div className="db-day">{dbDay}</div>
          </>
        ) : (
          <div className="db-nodate">NO<br />DATE</div>
        )}
      </div>

      {/* Install info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontWeight: 700, fontSize: 14, color: 'var(--text)',
          marginBottom: 3,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {install.contactName || 'Unknown Contact'}
        </div>

        <div style={{
          fontSize: 13, color: 'var(--text-muted)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          marginBottom: 5,
        }}>
          {install.vehicle || 'Vehicle TBD'}
        </div>

        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {install.package && (
            <span className="badge badge-blue">{install.package}</span>
          )}
          {install.stockNumber && (
            <span className="badge badge-gray">#{install.stockNumber}</span>
          )}
        </div>

        {install.notes ? (
          <div style={{
            marginTop: 5, fontSize: 12, color: 'var(--text-dim)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {install.notes}
          </div>
        ) : null}
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
        <button
          onClick={e => { e.stopPropagation(); onEdit() }}
          style={{
            background: 'var(--bg-input)',
            border: '1px solid var(--border)',
            color: 'var(--text-muted)',
            borderRadius: 6,
            padding: '6px 12px',
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          Edit
        </button>
        <button
          onClick={handleDeleteTap}
          style={{
            background:   confirming ? 'var(--danger-bg)' : 'transparent',
            border:       `1px solid ${confirming ? 'rgba(239,68,68,0.3)' : 'transparent'}`,
            color:        confirming ? 'var(--danger)' : 'var(--text-dim)',
            borderRadius: 6,
            padding:      '6px 12px',
            fontSize:     12,
            fontWeight:   600,
            transition:   'all 0.2s',
            minWidth:     48,
            textAlign:    'center',
          }}
        >
          {confirming ? 'Sure?' : 'Del'}
        </button>
      </div>

    </div>
  )
}
