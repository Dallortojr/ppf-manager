'use client'

import { useState, useCallback, useEffect } from 'react'
import UploadView   from './UploadView'
import PreviewView  from './PreviewView'
import CalendarView from './CalendarView'
import InstallsView from './InstallsView'

/* ── SVG icons ───────────────────────────────────────────────────────────── */
function IconUpload({ active }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={active ? 2.5 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
      <polyline points="17 8 12 3 7 8"/>
      <line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
  )
}
function IconCalendar({ active }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={active ? 2.5 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8"  y1="2" x2="8"  y2="6"/>
      <line x1="3"  y1="10" x2="21" y2="10"/>
    </svg>
  )
}
function IconList({ active }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={active ? 2.5 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <line x1="8"  y1="6"  x2="21" y2="6"/>
      <line x1="8"  y1="12" x2="21" y2="12"/>
      <line x1="8"  y1="18" x2="21" y2="18"/>
      <line x1="3"  y1="6"  x2="3.01" y2="6"/>
      <line x1="3"  y1="12" x2="3.01" y2="12"/>
      <line x1="3"  y1="18" x2="3.01" y2="18"/>
    </svg>
  )
}
function IconBack() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  )
}

/* ── App logo mark ───────────────────────────────────────────────────────── */
function LogoMark() {
  return (
    <div style={{
      width: 28, height: 28, background: 'var(--accent)', borderRadius: 7,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
        <path d="M10 2L3 6v6c0 3.5 2.8 6.8 7 8 4.2-1.2 7-4.5 7-8V6L10 2z" fill="white" opacity="0.9"/>
      </svg>
    </div>
  )
}

const TABS = [
  { id: 'upload',   label: 'Upload',   Icon: IconUpload   },
  { id: 'calendar', label: 'Calendar', Icon: IconCalendar },
  { id: 'installs', label: 'Installs', Icon: IconList     },
]

export default function AppShell() {
  const [tab,           setTab]           = useState('upload')
  const [pending,       setPending]       = useState(null)   // { data, imagePreview }
  const [editing,       setEditing]       = useState(null)   // existing install
  const [toast,         setToast]         = useState(null)
  const [installs,      setInstalls]      = useState([])
  const [ready,         setReady]         = useState(false)

  /* Load all installs once on mount */
  useEffect(() => {
    fetch('/api/installs')
      .then(r => r.json())
      .then(j => { if (j.installs) setInstalls(j.installs) })
      .catch(console.error)
      .finally(() => setReady(true))
  }, [])

  const showToast = useCallback((msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2800)
  }, [])

  const isPreview = tab === 'preview'

  /* Called by UploadView when extraction succeeds */
  const handleExtracted = useCallback((data, imagePreview) => {
    setPending({ data, imagePreview })
    setEditing(null)
    setTab('preview')
  }, [])

  /* Called by InstallsView / CalendarView when user taps Edit */
  const handleEdit = useCallback((install) => {
    setEditing(install)
    setPending(null)
    setTab('preview')
  }, [])

  /* Called by PreviewView after successful save */
  const handleSaved = useCallback((install) => {
    setInstalls(prev => {
      const idx = prev.findIndex(i => i.id === install.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = install
        return next
      }
      return [install, ...prev]
    })
    setPending(null)
    setEditing(null)
    showToast('✓ Install saved')
    setTab('calendar')
  }, [showToast])

  /* Called by PreviewView or nav when user cancels */
  const handleCancel = useCallback(() => {
    setPending(null)
    setEditing(null)
    setTab('upload')
  }, [])

  /* Called by delete actions in list / calendar */
  const handleDeleted = useCallback((id) => {
    setInstalls(prev => prev.filter(i => i.id !== id))
    showToast('Install deleted')
  }, [showToast])

  /* Tab change — abandon preview if user taps away */
  const handleTabChange = useCallback((id) => {
    if (tab === 'preview') {
      setPending(null)
      setEditing(null)
    }
    setTab(id)
  }, [tab])

  /* Header title */
  const headerTitle = isPreview
    ? (editing ? 'Edit Install' : 'Review & Confirm')
    : 'PPF Manager'

  return (
    <>
      {/* ── Sticky header ──────────────────────────────────────────────── */}
      <header className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {isPreview && (
            <button className="btn-ghost" style={{ padding: '4px 2px', marginRight: 2 }} onClick={handleCancel}>
              <IconBack />
            </button>
          )}
          <LogoMark />
          <h1>{headerTitle}</h1>
        </div>
        <span style={{ fontSize: 12, color: 'var(--text-dim)', fontWeight: 500 }}>
          {ready ? `${installs.length} saved` : ''}
        </span>
      </header>

      {/* ── Page content ───────────────────────────────────────────────── */}
      <main className="page">
        {tab === 'upload' && (
          <UploadView onExtracted={handleExtracted} />
        )}

        {tab === 'preview' && (pending || editing) && (
          <PreviewView
            extractedData={pending?.data   ?? null}
            imagePreview={pending?.imagePreview ?? null}
            existingInstall={editing}
            onSaved={handleSaved}
            onCancel={handleCancel}
          />
        )}

        {tab === 'calendar' && (
          <CalendarView
            installs={installs}
            onEdit={handleEdit}
            onDelete={handleDeleted}
          />
        )}

        {tab === 'installs' && (
          <InstallsView
            installs={installs}
            ready={ready}
            onEdit={handleEdit}
            onDelete={handleDeleted}
            onNewInstall={() => handleTabChange('upload')}
          />
        )}
      </main>

      {/* ── Bottom navigation ───────────────────────────────────────────── */}
      <nav className="bottom-nav">
        {TABS.map(({ id, label, Icon }) => {
          const active = tab === id || (tab === 'preview' && id === 'upload')
          return (
            <button
              key={id}
              className={`nav-tab${active ? ' active' : ''}`}
              onClick={() => handleTabChange(id)}
            >
              <Icon active={active} />
              {label}
            </button>
          )
        })}
      </nav>

      {/* ── Toast ──────────────────────────────────────────────────────── */}
      {toast && <div className="toast">{toast}</div>}
    </>
  )
}
