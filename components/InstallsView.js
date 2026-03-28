'use client'

import { useState, useMemo } from 'react'
import { todayStr } from '@/lib/format'
import InstallRow from './InstallRow'

export default function InstallsView({ installs, ready, onEdit, onDelete, onNewInstall }) {
  const [query,  setQuery]  = useState('')
  const [filter, setFilter] = useState('all') // all | upcoming | past

  const today = todayStr()

  const counts = useMemo(() => ({
    all:      installs.length,
    upcoming: installs.filter(i => !i.date || i.date >= today).length,
    past:     installs.filter(i => i.date && i.date < today).length,
  }), [installs, today])

  const filtered = useMemo(() => {
    let list = installs

    // Search
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(i =>
        (i.contactName  || '').toLowerCase().includes(q) ||
        (i.vehicle      || '').toLowerCase().includes(q) ||
        (i.package      || '').toLowerCase().includes(q) ||
        (i.stockNumber  || '').toLowerCase().includes(q) ||
        (i.notes        || '').toLowerCase().includes(q)
      )
    }

    // Filter
    if (filter === 'upcoming') list = list.filter(i => !i.date || i.date >= today)
    if (filter === 'past')     list = list.filter(i => i.date && i.date < today)

    // Sort
    if (filter === 'upcoming') return [...list].sort((a,b) => (a.date||'9').localeCompare(b.date||'9'))
    if (filter === 'past')     return [...list].sort((a,b) => (b.date||'').localeCompare(a.date||''))
    return [...list].sort((a,b) => (b.createdAt||'').localeCompare(a.createdAt||''))
  }, [installs, query, filter, today])

  if (!ready) {
    return (
      <div className="container" style={{ paddingTop:40, textAlign:'center' }}>
        <div className="spinner" style={{ margin:'0 auto 12px' }} />
        <p style={{ color:'var(--text-muted)', fontSize:14 }}>Loading installs…</p>
      </div>
    )
  }

  return (
    <div className="container" style={{ paddingTop: 16 }}>

      {/* Search input */}
      <div style={{ position:'relative', marginBottom:10 }}>
        <svg
          width="16" height="16" viewBox="0 0 24 24"
          fill="none" stroke="var(--text-muted)"
          strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
          style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}
        >
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          type="search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search by name, vehicle, package, stock…"
          style={{ paddingLeft: 36 }}
        />
      </div>

      {/* Filter pills */}
      <div style={{ display:'flex', gap:6, marginBottom:16, flexWrap:'wrap' }}>
        {[
          { id:'all',      label:`All (${counts.all})`           },
          { id:'upcoming', label:`Upcoming (${counts.upcoming})`  },
          { id:'past',     label:`Past (${counts.past})`          },
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            style={{
              padding:    '6px 14px',
              borderRadius: 20,
              fontSize:   12,
              fontWeight: 700,
              background: filter === f.id ? 'var(--accent)' : 'var(--bg-card)',
              color:      filter === f.id ? 'white'          : 'var(--text-muted)',
              border:     filter === f.id ? '1px solid var(--accent)' : '1px solid var(--border)',
              transition: 'all 0.15s',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Results */}
      {installs.length === 0 ? (
        <div className="empty-state">
          <span className="ei">🛡️</span>
          <p>No installs saved yet</p>
          <span>Upload a screenshot to extract your first job</span>
          <button
            className="btn-primary"
            style={{ marginTop:20, width:'auto', padding:'12px 28px', borderRadius:10 }}
            onClick={onNewInstall}
          >
            Upload Screenshot
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <p style={{ fontSize:14, color:'var(--text-muted)', textAlign:'center', marginTop:32 }}>
          No installs match your search.
        </p>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {filtered.map(inst => (
            <InstallRow
              key={inst.id}
              install={inst}
              onEdit={() => onEdit(inst)}
              onDelete={() => onDelete(inst.id)}
            />
          ))}
        </div>
      )}

    </div>
  )
}
