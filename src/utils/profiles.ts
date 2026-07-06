// Player profiles CRUD, persisted to localStorage under `knueffl-profiles` as a
// plain array of Profile records. Reads are defensive (bad/legacy blobs degrade
// to an empty list) mirroring the pattern in src/utils/gameHistory.ts.
import type { Profile } from '../types/profile'

const PROFILES_KEY = 'knueffl-profiles'

export function loadProfiles(): Profile[] {
  try {
    const raw = localStorage.getItem(PROFILES_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveProfiles(list: Profile[]): void {
  try {
    localStorage.setItem(PROFILES_KEY, JSON.stringify(list))
  } catch {}
}

export function getProfile(id: string): Profile | undefined {
  return loadProfiles().find((p) => p.id === id)
}

// Insert a new profile or replace the existing one with the same id.
export function upsertProfile(p: Profile): void {
  const list = loadProfiles()
  const idx = list.findIndex((x) => x.id === p.id)
  if (idx >= 0) {
    list[idx] = p
    saveProfiles(list)
  } else {
    saveProfiles([...list, p])
  }
}

export function removeProfile(id: string): void {
  const list = loadProfiles()
  const next = list.filter((p) => p.id !== id)
  if (next.length !== list.length) saveProfiles(next)
}

export function makeProfileId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

// Turn a user-selected image file into a compact square avatar data URL: reject
// non-images, center-crop to a square, downscale to 128x128, and JPEG-compress.
export function processAvatarFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Not an image file'))
      return
    }

    const url = URL.createObjectURL(file)
    const img = new Image()

    img.onload = () => {
      try {
        const SIZE = 128
        const canvas = document.createElement('canvas')
        canvas.width = SIZE
        canvas.height = SIZE
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Canvas not supported'))
          return
        }
        // Center-crop the largest square that fits within the source image.
        const side = Math.min(img.naturalWidth, img.naturalHeight)
        const sx = (img.naturalWidth - side) / 2
        const sy = (img.naturalHeight - side) / 2
        ctx.drawImage(img, sx, sy, side, side, 0, 0, SIZE, SIZE)
        resolve(canvas.toDataURL('image/jpeg', 0.8))
      } catch (err) {
        reject(err instanceof Error ? err : new Error('Failed to process image'))
      } finally {
        URL.revokeObjectURL(url)
      }
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }

    img.src = url
  })
}
