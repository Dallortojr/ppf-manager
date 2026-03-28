'use client'

import { useState, useEffect } from 'react'
import { formatOutput } from '@/lib/format'

const EMPTY = { contactName: '', vehicle: '', package: '', stockNumber: '', date: '', notes: '' }

export default function PreviewView({ extractedData, imagePreview, existingInstall, onSaved, onCancel }) {
  const [form,       setForm]       = useState(EMPTY)
  const [saving,     setSaving]     = useState(false)
  const [error,      setError]      = useState('')
  const [showOutput, setShowOutput] = useState(false)

  useEffect(() => {
    if (existingInstall) {
      setForm({
        contactName: existingInstall.contactName || '',
        vehicle:     existingInstall.vehicle     || '',
        package:     existingInstall.package     || '',
        stockNumber: existingInstall.stockNumber || '',
        date:        existingInstall.date        || '',
        notes:       existingInstall.notes       || '',
      })
    } else if (extractedData) {
      setForm({
        contactName: extractedData.contactName || '',
        vehicle:     extractedData.vehicle     || '',
        package:     extractedData.package     || '',
        stockNumber: extractedData.stockNumber || '',
        date:        extractedData.date        || '',
        notes:       extractedData.notes       || '',
      })
    }
  }, [extractedData, existingInstall])

  const set = field => e => {
    setForm(f => ({ ...f, [field]: e.target.value }))
    setError('')
  }

  const validate = () => {
    if (!form.contactName.trim()) return 'Contact Name is required.'
    if (!form.vehicle.trim())     return 'Vehicle is required.'
    if (!form.package.trim())     return 'Package is required.'
    if (!form.date.trim())        return 'Install Date is required.'
    return null
  }

  const handleSave = async () => {
    const err = validate()
    if (err) { setError(err); return }

    setSaving(true)
    setError('')

    try {
      const url    = existingInstall ? `/api/installs/${existingInstall.id}` : '/api/installs'
      const method = existingInstall ? 'PATCH' : 'POST'

      const res  = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      })
      const json = await res.json()

      if (!res.ok) {
        setError(json.error || `Save failed (${res.status}) — please try again.`)
        return
      }

      onSaved(json.install)
    } catch {
      setError('Network error. Check your connection and try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="container" style={{ paddingTop: 16, paddingBottom: 32 }}>

      {/* Source screenshot thumbnail */}
      {imagePreview && (
        <div style={{ marginBottom: 14 }}>
          <img
            src={imagePreview}
            alt="Source screenshot"
            style={{
              width: '100%', maxHeight: 160,
              objectFit: 'contain', objectPosition: 'top left',
              borderRadius: 10,
              border: '1px solid var(--border)',
              background: '#111',
            }}
          />
        </div>
      )}

      {/* Info bar */}
      {!existingInstall && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'var(--accent-bg)', borderRadius: 8,
          padding: '10px 12px', marginBottom: 16,
          fontSize: 13, color: 'var(--accent)',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
            style={{ flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8"  x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          Review extracted fields and correct anything before saving.
        </div>
      )}

      {/* Form */}
      <div className="field-group" style={{ marginBottom: 20 }}>

        <div>
          <label className="label">Contact Name *</label>
          <input
            type="text"
            value={form.contactName}
            onChange={set('contactName')}
            placeholder="Customer or dealer name"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="words"
          />
        </div>

        <div>
          <label className="label">Vehicle *</label>
          <input
            type="text"
            value={form.vehicle}
            onChange={set('vehicle')}
            placeholder="2024 Toyota Camry"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="words"
          />
        </div>

        <div>
          <label className="label">Package *</label>
          <input
            type="text"
            value={form.package}
            onChange={set('package')}
            placeholder="Full Front, Full Body, Hood Only…"
            autoComplete="off"
            autoCapitalize="words"
          />
        </div>

        <div>
          <label className="label">Stock Number</label>
          <input
            type="text"
            value={form.stockNumber}
            onChange={set('stockNumber')}
            placeholder="Optional"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="characters"
          />
        </div>

        <div>
          <label className="label">Install Date *</label>
          <input
            type="date"
            value={form.date}
            onChange={set('date')}
          />
        </div>

        <div>
          <label className="label">Notes</label>
          <textarea
            value={form.notes}
            onChange={set('notes')}
            placeholder="Special instructions, dealer info, contact number…"
            rows={3}
          />
        </div>

      </div>

      {/* Error */}
      {error && (
        <div className="msg-error fade-in" style={{ marginBottom: 16 }}>{error}</div>
      )}

      {/* Output format toggle */}
      <button
        className="btn-ghost"
        style={{ fontSize: 13, padding: '6px 2px', marginBottom: 8 }}
        onClick={() => setShowOutput(v => !v)}
      >
        {showOutput ? '▲ Hide' : '▼ Preview'} output format
      </button>

      {showOutput && (
        <div className="output-block fade-in" style={{ marginBottom: 16 }}>
          {formatOutput(form)}
        </div>
      )}

      {/* Buttons */}
      <button
        className="btn-primary"
        onClick={handleSave}
        disabled={saving}
        style={{ marginBottom: 10 }}
      >
        {saving ? 'Saving…' : existingInstall ? 'Update Install' : 'Save to Calendar'}
      </button>

      <button className="btn-secondary" onClick={onCancel}>
        Cancel
      </button>

    </div>
  )
}
