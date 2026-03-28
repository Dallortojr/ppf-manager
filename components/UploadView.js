'use client'

import { useState, useRef, useCallback } from 'react'

export default function UploadView({ onExtracted }) {
  const [dragOver,  setDragOver]  = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')
  const [preview,   setPreview]   = useState(null)
  const fileRef = useRef()

  const processFile = useCallback(async (file) => {
    if (!file) return
    setError('')
    setLoading(true)

    // Convert to base64
    let base64, dataUrl
    try {
      dataUrl = await new Promise((resolve, reject) => {
        const r = new FileReader()
        r.onload  = e => resolve(e.target.result)
        r.onerror = () => reject(new Error('Could not read file.'))
        r.readAsDataURL(file)
      })
      base64 = dataUrl.split(',')[1]
      setPreview(dataUrl)
    } catch (e) {
      setError(e.message)
      setLoading(false)
      return
    }

    // Normalise MIME (HEIC from iPhone is converted to jpeg for the API)
    let mime = file.type || 'image/jpeg'
    if (mime === 'image/heic' || mime === 'image/heif') mime = 'image/jpeg'

    try {
      const res  = await fetch('/api/extract', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ imageBase64: base64, mimeType: mime }),
      })
      const json = await res.json()

      if (!res.ok) {
        setError(json.error || `Server error (${res.status}) — please try again.`)
        setLoading(false)
        return
      }

      onExtracted(json.data, dataUrl)
    } catch {
      setError('Network error. Check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }, [onExtracted])

  const handleInput  = e => { const f = e.target.files?.[0]; if (f) processFile(f); e.target.value = '' }
  const handleDrop   = e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) processFile(f) }
  const handleDragOv = e => { e.preventDefault(); setDragOver(true) }

  return (
    <div className="container" style={{ paddingTop: 20 }}>
      {/* Hidden file input — accept="image/*" triggers camera roll on iOS */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={handleInput}
        style={{ display: 'none' }}
      />

      {/* Drop zone */}
      <div
        className={`dropzone${dragOver ? ' drag-over' : ''}`}
        style={{ marginBottom: 14 }}
        onClick={() => !loading && fileRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOv}
        onDragLeave={() => setDragOver(false)}
      >
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div className="spinner" style={{ width: 36, height: 36 }} />
            <p style={{ fontWeight: 600, fontSize: 15, margin: 0 }}>Reading screenshot…</p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>Claude Vision is extracting job details</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 58, height: 58, borderRadius: 16,
              background: 'var(--accent-bg)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 4,
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                stroke="var(--accent)" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
            </div>
            <p style={{ fontWeight: 700, fontSize: 16, margin: 0, color: 'var(--text)' }}>
              Tap to upload screenshot
            </p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0, textAlign: 'center', lineHeight: 1.5 }}>
              Choose from your camera roll or take a photo.<br />
              PNG, JPG, WEBP — any text message screenshot.
            </p>
          </div>
        )}
      </div>

      {/* Image preview */}
      {preview && !loading && (
        <div className="fade-in" style={{ marginBottom: 14 }}>
          <img src={preview} alt="Uploaded"
            style={{
              width: '100%', maxHeight: 200, objectFit: 'contain',
              borderRadius: 10, border: '1px solid var(--border)', background: '#111',
            }}
          />
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="msg-error fade-in" style={{ marginBottom: 14 }}>{error}</div>
      )}

      {/* How it works */}
      <div className="card" style={{ marginBottom: 14 }}>
        <p className="section-title">How it works</p>
        {[
          ['📱', 'Upload any text message screenshot from a customer or dealership'],
          ['🤖', 'Claude Vision extracts: contact, vehicle, package, stock # and date'],
          ['✏️', 'Review and edit the extracted data before saving'],
          ['📅', 'Install is saved permanently to your calendar'],
        ].map(([icon, text]) => (
          <div key={text} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 15, lineHeight: 1.5, flexShrink: 0 }}>{icon}</span>
            <span style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.5 }}>{text}</span>
          </div>
        ))}
      </div>

      {/* Manual entry */}
      <button
        className="btn-secondary"
        onClick={() => onExtracted({ contactName:'', vehicle:'', package:'', stockNumber:'', date:'', notes:'' }, null)}
      >
        + Add install manually
      </button>
    </div>
  )
}
