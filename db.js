/**
 * Storage layer — flat JSON file.
 *
 * Works on Vercel (writes to /tmp) and locally (writes to project root).
 * /tmp on Vercel resets between cold starts — for permanent production
 * persistence, replace the four exported functions below with calls to
 * Vercel Postgres, Supabase, or PlanetScale. Nothing else in the app
 * needs to change.
 */

import fs from 'fs'
import path from 'path'

const FILE = process.env.VERCEL
  ? '/tmp/ppf_installs.json'
  : path.join(process.cwd(), 'ppf_installs.json')

function read() {
  try {
    if (fs.existsSync(FILE)) {
      return JSON.parse(fs.readFileSync(FILE, 'utf8'))
    }
  } catch (_) {}
  return []
}

function write(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2), 'utf8')
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

/** Return all installs sorted newest-first by createdAt. */
export function getAllInstalls() {
  return read().sort((a, b) =>
    (b.createdAt || '').localeCompare(a.createdAt || '')
  )
}

/** Return one install by id, or null. */
export function getInstallById(id) {
  return read().find(i => i.id === id) || null
}

/** Create a new install. Returns the saved record. */
export function createInstall(fields) {
  const all = read()
  const record = {
    id: uid(),
    contactName: (fields.contactName || '').trim(),
    vehicle:     (fields.vehicle     || '').trim(),
    package:     (fields.package     || '').trim(),
    stockNumber: (fields.stockNumber || '').trim(),
    date:        (fields.date        || '').trim(),
    notes:       (fields.notes       || '').trim(),
    createdAt:   new Date().toISOString(),
    updatedAt:   new Date().toISOString(),
  }
  all.push(record)
  write(all)
  return record
}

/** Update an install by id. Returns updated record or null. */
export function updateInstall(id, fields) {
  const all = read()
  const i = all.findIndex(r => r.id === id)
  if (i === -1) return null
  all[i] = {
    ...all[i],
    contactName: fields.contactName !== undefined ? (fields.contactName || '').trim() : all[i].contactName,
    vehicle:     fields.vehicle     !== undefined ? (fields.vehicle     || '').trim() : all[i].vehicle,
    package:     fields.package     !== undefined ? (fields.package     || '').trim() : all[i].package,
    stockNumber: fields.stockNumber !== undefined ? (fields.stockNumber || '').trim() : all[i].stockNumber,
    date:        fields.date        !== undefined ? (fields.date        || '').trim() : all[i].date,
    notes:       fields.notes       !== undefined ? (fields.notes       || '').trim() : all[i].notes,
    updatedAt:   new Date().toISOString(),
  }
  write(all)
  return all[i]
}

/** Delete an install by id. Returns true if found and deleted. */
export function deleteInstall(id) {
  const all = read()
  const next = all.filter(r => r.id !== id)
  if (next.length === all.length) return false
  write(next)
  return true
}
