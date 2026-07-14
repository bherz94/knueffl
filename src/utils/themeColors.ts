// Runtime color theming.
//
// Tailwind v4 compiles every palette utility to `var(--color-<family>-<stop>)`
// and defines those variables in the stylesheet's `:root`. Setting the same
// variables inline on `document.documentElement` (higher specificity) recolors
// the whole app in both light and dark mode without touching any component.
//
// - Accent classes were refactored to `primary-*` / `secondary-*` tokens whose
//   defaults (in index.css @theme) reproduce the original teal/amber look.
// - Neutral surfaces still use `slate-*` (light) + `zinc-*` (dark); to tint them
//   we override BOTH families with one generated ramp.

const STOPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const

// Per-stop lightness/chroma reference curves captured from Tailwind's own ramps.
// A generated ramp keeps each stop's L, substitutes the picked hue, and scales
// chroma toward the picked color's chroma — so any pick keeps good contrast in
// both light and dark.
type Curve = readonly { l: number; c: number }[]

// teal — used as the primary reference curve
const PRIMARY_CURVE: Curve = [
  { l: 0.984, c: 0.014 }, { l: 0.953, c: 0.051 }, { l: 0.91, c: 0.096 },
  { l: 0.855, c: 0.138 }, { l: 0.777, c: 0.152 }, { l: 0.704, c: 0.14 },
  { l: 0.6, c: 0.118 }, { l: 0.511, c: 0.096 }, { l: 0.437, c: 0.078 },
  { l: 0.386, c: 0.063 }, { l: 0.277, c: 0.046 },
]

// amber — used as the secondary reference curve (more saturated)
const SECONDARY_CURVE: Curve = [
  { l: 0.987, c: 0.022 }, { l: 0.962, c: 0.059 }, { l: 0.924, c: 0.12 },
  { l: 0.879, c: 0.169 }, { l: 0.828, c: 0.189 }, { l: 0.769, c: 0.188 },
  { l: 0.666, c: 0.179 }, { l: 0.555, c: 0.163 }, { l: 0.473, c: 0.137 },
  { l: 0.414, c: 0.112 }, { l: 0.279, c: 0.077 },
]

// slate/zinc blend — used for neutral tinting. Lightness from slate (which the
// app uses in light mode); low chroma so tints stay subtle.
const NEUTRAL_CURVE: Curve = [
  { l: 0.984, c: 0.004 }, { l: 0.968, c: 0.006 }, { l: 0.929, c: 0.008 },
  { l: 0.869, c: 0.01 }, { l: 0.704, c: 0.014 }, { l: 0.554, c: 0.016 },
  { l: 0.446, c: 0.016 }, { l: 0.372, c: 0.014 }, { l: 0.279, c: 0.012 },
  { l: 0.21, c: 0.012 }, { l: 0.141, c: 0.01 },
]

// The chroma at each curve's mid stop (500), used as the reference against which
// a picked color's chroma is scaled.
const PRIMARY_REF_C = PRIMARY_CURVE[5].c
const SECONDARY_REF_C = SECONDARY_CURVE[5].c

export interface Oklch { l: number; c: number; h: number }

function srgbToLinear(v: number): number {
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
}

/** Convert a #rrggbb (or #rgb) hex string to OKLCH. */
export function hexToOklch(hex: string): Oklch {
  let h = hex.trim().replace('#', '')
  if (h.length === 3) h = h.split('').map((c) => c + c).join('')
  const r = srgbToLinear(parseInt(h.slice(0, 2), 16) / 255)
  const g = srgbToLinear(parseInt(h.slice(2, 4), 16) / 255)
  const b = srgbToLinear(parseInt(h.slice(4, 6), 16) / 255)

  const l_ = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m_ = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s_ = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)

  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_
  const a = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_
  const bb = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_

  const C = Math.sqrt(a * a + bb * bb)
  let H = (Math.atan2(bb, a) * 180) / Math.PI
  if (H < 0) H += 360
  return { l: L, c: C, h: H }
}

function round(n: number, d = 4): number {
  const f = 10 ** d
  return Math.round(n * f) / f
}

/**
 * Build an 11-stop ramp of `oklch(...)` strings from a base hue + chroma,
 * following a reference lightness/chroma curve.
 */
function buildRamp(hue: number, chromaScale: number, curve: Curve): string[] {
  return curve.map(({ l, c }) => {
    const chroma = round(Math.min(c * chromaScale, 0.37), 4)
    return `oklch(${round(l * 100, 2)}% ${chroma} ${round(hue, 2)})`
  })
}

export type Role = 'primary' | 'secondary' | 'neutral'

/** Spec for a single role: a base color, or 'default' to clear overrides. */
type RoleSpec = { hex: string } | 'default'

export interface ThemeSpec {
  primary: RoleSpec
  secondary: RoleSpec
  neutral: RoleSpec
}

export interface Preset {
  id: string
  swatch: string // representative color shown in the picker chip
  spec: ThemeSpec
}

// Preset 1 reproduces the original look exactly (no overrides). 2 & 3 tune
// primary + secondary + a neutral tint for a distinct feel in light and dark.
export const PRESETS: Preset[] = [
  {
    id: 'teal',
    swatch: '#0d9488',
    spec: { primary: 'default', secondary: 'default', neutral: 'default' },
  },
  {
    id: 'indigo',
    swatch: '#6366f1',
    spec: {
      primary: { hex: '#6366f1' }, // indigo
      secondary: { hex: '#ec4899' }, // pink
      neutral: { hex: '#64748b' }, // cool slate
    },
  },
  {
    id: 'rose',
    swatch: '#f43f5e',
    spec: {
      primary: { hex: '#f43f5e' }, // rose
      secondary: { hex: '#8b5cf6' }, // violet
      neutral: { hex: '#78716c' }, // warm stone
    },
  },
]

export const DEFAULT_PRESET_ID = PRESETS[0].id

function setRamp(el: HTMLElement, family: string, ramp: string[] | null) {
  STOPS.forEach((stop, i) => {
    const name = `--color-${family}-${stop}`
    if (ramp) el.style.setProperty(name, ramp[i])
    else el.style.removeProperty(name)
  })
}

function rampFor(role: Role, spec: RoleSpec): string[] | null {
  if (spec === 'default') return null
  const { c, h } = hexToOklch(spec.hex)
  if (role === 'primary') {
    return buildRamp(h, c / PRIMARY_REF_C, PRIMARY_CURVE)
  }
  if (role === 'secondary') {
    return buildRamp(h, c / SECONDARY_REF_C, SECONDARY_CURVE)
  }
  // neutral: keep chroma very low regardless of how saturated the pick is
  return buildRamp(h, 1, NEUTRAL_CURVE)
}

/** Apply a resolved theme spec by setting/clearing inline CSS variables. */
export function applyColorTheme(spec: ThemeSpec) {
  const el = document.documentElement
  setRamp(el, 'primary', rampFor('primary', spec.primary))
  setRamp(el, 'secondary', rampFor('secondary', spec.secondary))
  // Neutral tint overrides both families the app uses for surfaces.
  const neutral = rampFor('neutral', spec.neutral)
  setRamp(el, 'slate', neutral)
  setRamp(el, 'zinc', neutral)
}

/** The default effective hex for a role, used to seed the picker. */
export const DEFAULT_HEX: Record<Role, string> = {
  primary: '#0d9488',
  secondary: '#f59e0b',
  neutral: '#64748b',
}

export interface ColorTheme {
  preset: string
  custom?: Partial<Record<Role, string>>
}

/** Resolve stored ColorTheme state into a concrete ThemeSpec to apply. */
export function resolveSpec(theme: ColorTheme): ThemeSpec {
  if (theme.preset !== 'custom') {
    const preset = PRESETS.find((p) => p.id === theme.preset) ?? PRESETS[0]
    return preset.spec
  }
  const role = (r: Role): RoleSpec => {
    const hex = theme.custom?.[r]
    return hex ? { hex } : 'default'
  }
  return { primary: role('primary'), secondary: role('secondary'), neutral: role('neutral') }
}

/** The effective hex for a role given current theme state (for seeding pickers). */
export function effectiveHex(theme: ColorTheme, role: Role): string {
  if (theme.preset === 'custom' && theme.custom?.[role]) return theme.custom[role]!
  if (theme.preset !== 'custom' && theme.preset !== DEFAULT_PRESET_ID) {
    const preset = PRESETS.find((p) => p.id === theme.preset)
    const spec = preset?.spec[role]
    if (spec && spec !== 'default') return spec.hex
  }
  return DEFAULT_HEX[role]
}
