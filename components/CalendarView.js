'use client'

import { useState, useMemo } from 'react'
import { todayStr, formatDate } from '@/lib/format'
import InstallRow from './InstallRow'

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]
const DAY_LABELS = ['S','M','T','W','T','F','S']
const DAY_SHORT  = ['Su','Mo','Tu','We','Th','Fr','Sa']

function pad2(n) { return String(n).padStart(2,'0') }

function makeDateStr(year, month, day) {
  return `${year}-${pad2(month + 1)}-${pad2(day)}`
}

/* Returns the Sunday that starts the week containing `d` */
function weekStart(d) {
  const s = new Date(d)
  s.setDate(d.getDate() - d.getDay())
  return s
}

/* ── Switcher ─────────────────────────────────────────────────────────────── */
function ViewSwitcher({ current, onChange }) {
  return (
    <div style={{
      display: 'flex', gap: 4, marginBottom: 16,
      background: 'var(--bg-input)', borderRadius: 8, padding: 3,
    }}>
      {['month','week','list'].map(v => (
        <button
          key={v}
          onClick={() => onChange(v)}
          style={{
            flex: 1, padding: '7px 0',
            background:   current === v ? 'var(--bg-card)' : 'transparent',
            color:        current === v ? 'var(--text)'    : 'var(--text-muted)',
            border:       current === v ? '1px solid var(--border)' : '1px solid transparent',
            borderRadius: 6,
            fontSize:     13,
            fontWeight:   700,
            textTransform:'capitalize',
            transition:   'all 0.15s',
          }}
        >
          {v}
        </button>
      ))}
    </div>
  )
}

/* ── Month view ───────────────────────────────────────────────────────────── */
function MonthView({ cursor, setCursor, byDate, onEdit, onDelete }) {
  const [selected, setSelected] = useState(null)
  const today = todayStr()

  const year  = cursor.getFullYear()
  const month = cursor.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDay    = new Date(year, month, 1).getDay()

  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)

  const selectedInstalls = selected ? (byDate[selected] || []) : []

  return (
    <>
      {/* Nav */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
        <button className="btn-ghost" style={{ padding:'6px 12px', fontSize:20 }}
          onClick={() => { setSelected(null); setCursor(d => new Date(d.getFullYear(), d.getMonth()-1, 1)) }}>
          ‹
        </button>
        <span style={{ fontWeight:700, fontSize:16 }}>{MONTH_NAMES[month]} {year}</span>
        <button className="btn-ghost" style={{ padding:'6px 12px', fontSize:20 }}
          onClick={() => { setSelected(null); setCursor(d => new Date(d.getFullYear(), d.getMonth()+1, 1)) }}>
          ›
        </button>
      </div>

      {/* Day headers */}
      <div className="cal-grid" style={{ marginBottom: 3 }}>
        {DAY_LABELS.map((d,i) => <div key={i} className="cal-header-cell">{d}</div>)}
      </div>

      {/* Cells */}
      <div className="cal-grid" style={{ marginBottom: 16 }}>
        {cells.map((day, i) => {
          if (!day) return <div key={i} className="cal-cell empty" />
          const ds       = makeDateStr(year, month, day)
          const count    = byDate[ds]?.length || 0
          const isToday  = ds === today
          const isSel    = ds === selected
          return (
            <div
              key={i}
              className={`cal-cell${isToday ? ' today' : ''}${isSel ? ' selected' : ''}`}
              onClick={() => setSelected(isSel ? null : ds)}
            >
              <div className="cal-day-num">{day}</div>
              {count > 0 && <div className="cal-dot" />}
              {count > 1 && <div className="cal-count">{count}</div>}
            </div>
          )
        })}
      </div>

      {/* Selected day panel */}
      {selected && (
        <div className="fade-in">
          <p className="section-title" style={{ marginBottom:10 }}>{formatDate(selected)}</p>
          {selectedInstalls.length === 0 ? (
            <p style={{ fontSize:14, color:'var(--text-muted)', paddingLeft:2 }}>No installs on this day.</p>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {selectedInstalls.map(inst => (
                <InstallRow key={inst.id} install={inst}
                  onEdit={() => onEdit(inst)} onDelete={() => onDelete(inst.id)} />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  )
}

/* ── Week view ────────────────────────────────────────────────────────────── */
function WeekView({ cursor, setCursor, byDate, onEdit, onDelete }) {
  const today = todayStr()
  const start = weekStart(cursor)
  const days  = Array.from({ length:7 }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return d
  })

  const label = `${days[0].toLocaleDateString('en-US',{month:'short',day:'numeric'})} – ${days[6].toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}`

  return (
    <>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
        <button className="btn-ghost" style={{ padding:'6px 12px', fontSize:20 }}
          onClick={() => setCursor(d => new Date(d.getTime() - 7*86400000))}>‹</button>
        <span style={{ fontWeight:600, fontSize:13, textAlign:'center' }}>{label}</span>
        <button className="btn-ghost" style={{ padding:'6px 12px', fontSize:20 }}
          onClick={() => setCursor(d => new Date(d.getTime() + 7*86400000))}>›</button>
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
        {days.map(d => {
          const ds           = d.toISOString().split('T')[0]
          const dayInstalls  = byDate[ds] || []
          const isToday      = ds === today

          return (
            <div key={ds}>
              {/* Day label row */}
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom: dayInstalls.length ? 8 : 0 }}>
                <div style={{
                  width:38, height:38, borderRadius:'50%', flexShrink:0,
                  background: isToday ? 'var(--accent)' : 'var(--bg-input)',
                  display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                }}>
                  <span style={{ fontSize:9, fontWeight:700, lineHeight:1, textTransform:'uppercase', letterSpacing:'0.4px',
                    color: isToday ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)' }}>
                    {DAY_SHORT[d.getDay()]}
                  </span>
                  <span style={{ fontSize:14, fontWeight:800, lineHeight:1.1,
                    color: isToday ? 'white' : 'var(--text)' }}>
                    {d.getDate()}
                  </span>
                </div>
                {dayInstalls.length === 0 && (
                  <span style={{ fontSize:13, color:'var(--text-dim)' }}>No installs</span>
                )}
              </div>

              {dayInstalls.length > 0 && (
                <div style={{ paddingLeft:48, display:'flex', flexDirection:'column', gap:6 }}>
                  {dayInstalls.map(inst => (
                    <InstallRow key={inst.id} install={inst}
                      onEdit={() => onEdit(inst)} onDelete={() => onDelete(inst.id)} />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}

/* ── List view ────────────────────────────────────────────────────────────── */
function ListView({ installs, onEdit, onDelete }) {
  const today    = todayStr()
  const upcoming = useMemo(() => [...installs].filter(i => !i.date || i.date >= today).sort((a,b)=>(a.date||'').localeCompare(b.date||'')), [installs, today])
  const noDate   = useMemo(() => installs.filter(i => !i.date), [installs])
  const past     = useMemo(() => [...installs].filter(i => i.date && i.date < today).sort((a,b)=>b.date.localeCompare(a.date)), [installs, today])

  if (installs.length === 0) {
    return (
      <div className="empty-state">
        <span className="ei">📅</span>
        <p>No installs yet</p>
        <span>Upload a screenshot to schedule your first install</span>
      </div>
    )
  }

  const Section = ({ title, items }) => items.length === 0 ? null : (
    <div style={{ marginBottom:20 }}>
      <p className="section-title">{title} ({items.length})</p>
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        {items.map(inst => (
          <InstallRow key={inst.id} install={inst}
            onEdit={() => onEdit(inst)} onDelete={() => onDelete(inst.id)} />
        ))}
      </div>
    </div>
  )

  return (
    <>
      <Section title="Upcoming"     items={upcoming.filter(i => i.date)} />
      <Section title="No date set"  items={noDate}   />
      <Section title="Past"         items={past}      />
    </>
  )
}

/* ── Main export ──────────────────────────────────────────────────────────── */
export default function CalendarView({ installs, onEdit, onDelete }) {
  const [view,   setView]   = useState('month')
  const [cursor, setCursor] = useState(new Date())

  // Index installs by date string for O(1) lookup
  const byDate = useMemo(() => {
    const map = {}
    for (const inst of installs) {
      if (inst.date) {
        if (!map[inst.date]) map[inst.date] = []
        map[inst.date].push(inst)
      }
    }
    return map
  }, [installs])

  return (
    <div className="container" style={{ paddingTop: 16 }}>
      <ViewSwitcher current={view} onChange={setView} />

      {view === 'month' && (
        <MonthView cursor={cursor} setCursor={setCursor}
          byDate={byDate} onEdit={onEdit} onDelete={onDelete} />
      )}
      {view === 'week' && (
        <WeekView cursor={cursor} setCursor={setCursor}
          byDate={byDate} onEdit={onEdit} onDelete={onDelete} />
      )}
      {view === 'list' && (
        <ListView installs={installs} onEdit={onEdit} onDelete={onDelete} />
      )}
    </div>
  )
}
