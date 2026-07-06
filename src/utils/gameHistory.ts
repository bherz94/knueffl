// Past-games history + high-score aggregation. Persisted to localStorage under
// `knueffl-history` as an append-only list of lightweight completed-game records
// (name/total/place per player). Everything the leaderboard shows is derived
// from these records. Full per-player scorecards are stored separately, one blob
// per game under `knueffl-board-<id>`, and loaded lazily only when a game's board
// is viewed (Task 33) — so opening the history never parses scorecards.

import type { PlayerScores, ScorableCategory } from '../types/game'
import { ALL_SCORABLE, makeEmptyScores } from '../types/game'
import type { Profile } from '../types/profile'
import { getProfile, loadProfiles, upsertProfile } from './profiles'
import { calcGrandTotal } from './scoring'

export interface GameResult {
  name: string
  total: number
  place: number
  // Full filled-in scorecard. As of Task 33 this is NOT persisted inline — it's
  // stored under a per-game key and stripped from the list record. It survives
  // here only as the transport into `recordGame`, and on legacy records written
  // before Task 33 (which are still read as a fallback).
  scores?: PlayerScores
  // Optional link to a saved Profile and a cached copy of its avatar data URL.
  profileId?: string
  avatar?: string
}

export interface GameRecord {
  id: string // stable per game (GameState.gameId), used to dedupe on re-record
  finishedAt: number
  virtualDice: boolean
  results: GameResult[] // ordered by placement (winner first)
  // True when a scorecard blob was stored under `knueffl-board-<id>` (Task 33).
  hasBoard?: boolean
}

const HISTORY_KEY = 'knueffl-history'
const BOARD_KEY_PREFIX = 'knueffl-board-'
const boardKey = (id: string) => `${BOARD_KEY_PREFIX}${id}`

export function loadHistory(): GameRecord[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function save(records: GameRecord[]) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(records))
  } catch {}
}

// ---- Per-game scorecard blobs (lazy-loaded; Task 33) ----------------------

function saveGameBoard(id: string, boards: PlayerScores[]) {
  try {
    localStorage.setItem(boardKey(id), JSON.stringify(boards))
  } catch {}
}

function loadGameBoard(id: string): PlayerScores[] | null {
  try {
    const raw = localStorage.getItem(boardKey(id))
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : null
  } catch {
    return null
  }
}

function removeGameBoard(id: string) {
  try {
    localStorage.removeItem(boardKey(id))
  } catch {}
}

// Scorecards for a game, in the same order as `record.results`. Prefers the
// lazily-stored per-game blob; falls back to inline scores on legacy records.
export function getGameBoard(record: GameRecord): PlayerScores[] | null {
  const stored = loadGameBoard(record.id)
  if (stored && stored.length === record.results.length) return stored
  if (record.results.length > 0 && record.results.every((r) => !!r.scores)) {
    return record.results.map((r) => r.scores!)
  }
  return null
}

// True when a game's board can be shown (lazy blob or legacy inline scores).
export function recordHasBoard(record: GameRecord): boolean {
  return (
    record.hasBoard === true ||
    (record.results.length > 0 && record.results.every((r) => !!r.scores))
  )
}

// Upsert by id: a game may re-record on reload or after a post-game correction.
// Keep the original finishedAt so the timestamp stays put; refresh the results.
// Scorecards are split out into a per-game blob and stripped from the list record.
export function recordGame(record: GameRecord) {
  const hasBoard = record.results.length > 0 && record.results.every((r) => !!r.scores)
  if (hasBoard) saveGameBoard(record.id, record.results.map((r) => r.scores!))

  const lightResults: GameResult[] = record.results.map(({ scores: _scores, ...rest }) => rest)
  const lightRecord: GameRecord = { ...record, results: lightResults, hasBoard }

  const records = loadHistory()
  const existing = records.find((r) => r.id === record.id)
  if (existing) {
    existing.results = lightRecord.results
    existing.virtualDice = lightRecord.virtualDice
    existing.hasBoard = lightRecord.hasBoard
    save(records)
  } else {
    save([...records, lightRecord])
  }
}

export function removeRecord(id: string) {
  const records = loadHistory()
  const next = records.filter((r) => r.id !== id)
  if (next.length !== records.length) {
    removeGameBoard(id)
    save(next)
  }
}

export function clearHistory() {
  try {
    // Drop every per-game board blob alongside the list.
    for (const record of loadHistory()) removeGameBoard(record.id)
    localStorage.removeItem(HISTORY_KEY)
  } catch {}
}

export interface PlayerStats {
  key: string // the identity across games: profileId when present, else lowercased name
  profileId?: string // set when this player was linked to a saved profile
  name: string // display name, using the most recent casing seen
  avatar?: string // most recent avatar cached on a record (fallback; see resolveAvatar)
  gamesPlayed: number
  wins: number // number of 1st-place finishes
  bestGame: number // highest single-game total
  bestGameId?: string // id of the game that produced `bestGame` (Task 34)
  avgScore: number // mean grand total across their games, rounded
}

// Set of profile ids that currently exist, for detecting results whose linked
// profile was later deleted (Task 44). Preload once and pass into isProfileDeleted
// to avoid re-reading localStorage per row.
export function existingProfileIds(): Set<string> {
  return new Set(loadProfiles().map((p) => p.id))
}

// A result's linked profile counts as deleted when it carries a `profileId` that
// no longer resolves to a saved profile. Profile-less / legacy results (no
// `profileId`) are never "deleted".
export function isProfileDeleted(profileId: string | undefined, ids?: Set<string>): boolean {
  if (!profileId) return false
  return !(ids ?? existingProfileIds()).has(profileId)
}

// Aggregate players across all games. Identity is keyed by `profileId` when a
// result carries one (so a renamed profile still aggregates), otherwise it falls
// back to the lowercased, trimmed name — preserving behavior for legacy /
// profile-less records. Old name-keyed and new profile-keyed records for the same
// real person are intentionally NOT merged.
export function aggregateStats(records: GameRecord[]): PlayerStats[] {
  const byKey = new Map<string, PlayerStats & { totalPoints: number; lastSeen: number }>()

  // Oldest first so the newest game wins the display-name casing.
  const chronological = [...records].sort((a, b) => a.finishedAt - b.finishedAt)
  // Deleted-profile results are dropped from the leaderboards entirely (Task 44).
  const existing = existingProfileIds()

  for (const record of chronological) {
    for (const r of record.results) {
      if (isProfileDeleted(r.profileId, existing)) continue
      const key = r.profileId ?? r.name.trim().toLowerCase()
      if (!key) continue
      const stats = byKey.get(key) ?? {
        key,
        profileId: r.profileId,
        name: r.name,
        avatar: undefined,
        gamesPlayed: 0,
        wins: 0,
        bestGame: 0,
        bestGameId: undefined,
        avgScore: 0,
        totalPoints: 0,
        lastSeen: 0,
      }
      stats.name = r.name // most recent casing (chronological order)
      if (r.profileId) stats.profileId = r.profileId
      if (r.avatar) stats.avatar = r.avatar // keep the most recent cached avatar
      stats.gamesPlayed += 1
      stats.totalPoints += r.total
      if (r.place === 1) stats.wins += 1
      // Strictly greater so a tie keeps the first (older) game seen.
      if (r.total > stats.bestGame) {
        stats.bestGame = r.total
        stats.bestGameId = record.id
      }
      stats.lastSeen = record.finishedAt
      byKey.set(key, stats)
    }
  }

  return [...byKey.values()].map(({ totalPoints, lastSeen: _lastSeen, ...s }) => ({
    ...s,
    avgScore: s.gamesPlayed > 0 ? Math.round(totalPoints / s.gamesPlayed) : 0,
  }))
}

// Pick the avatar to display for a history entry: prefer the linked profile's
// CURRENT avatar (so renamed / re-photographed profiles show their latest
// picture), then any avatar cached on the record/result, else undefined so the
// colored-initial fallback in <PlayerAvatar> kicks in. Pass a preloaded profiles
// map when resolving many rows to avoid re-reading localStorage per call.
export function resolveAvatar(
  profileId: string | undefined,
  fallbackAvatar: string | undefined,
  profiles?: Map<string, Profile>,
): string | undefined {
  if (profileId) {
    const profile = profiles ? profiles.get(profileId) : getProfile(profileId)
    if (profile?.avatar) return profile.avatar
  }
  return fallbackAvatar
}

export type LeaderboardMetric = 'bestGame' | 'wins' | 'avgScore'

// Players ranked by the chosen metric (desc). Zero-value entries are dropped
// so, e.g., the Wins board only lists players who have actually won.
export function rankBy(stats: PlayerStats[], metric: LeaderboardMetric): PlayerStats[] {
  return stats
    .filter((s) => s[metric] > 0)
    .sort((a, b) => b[metric] - a[metric] || b.gamesPlayed - a.gamesPlayed)
}

// ---- Debug seeding (dev only) --------------------------------------------

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function makeId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

// A plausible score for a category, used only to fabricate debug totals.
function plausibleScore(cat: ScorableCategory): number {
  switch (cat) {
    case 'ones': return randInt(1, 5) * 1
    case 'twos': return randInt(1, 5) * 2
    case 'threes': return randInt(1, 5) * 3
    case 'fours': return randInt(1, 5) * 4
    case 'fives': return randInt(1, 5) * 5
    case 'sixes': return randInt(1, 5) * 6
    case 'threeOfAKind': return randInt(10, 25)
    case 'fourOfAKind': return randInt(12, 28)
    case 'fullHouse': return 25
    case 'smallStraight': return 30
    case 'largeStraight': return 40
    case 'kniffel': return 50
    case 'chance': return randInt(12, 30)
  }
}

// Random full scorecard with 0–2 categories crossed out (scored 0); the rest
// get a plausible value. Grand total is computed via the real scoring logic.
function randomScores(): PlayerScores {
  const scores = makeEmptyScores()
  const ids = ALL_SCORABLE.map((c) => c.id)
  const crossCount = randInt(0, 2)
  const crossed = new Set([...ids].sort(() => Math.random() - 0.5).slice(0, crossCount))
  for (const id of ids) {
    scores[id] = crossed.has(id) ? { status: 'crossed' } : { status: 'scored', value: plausibleScore(id) }
  }
  return scores
}

// A fixed roster of predefined debug profiles, linked to the seeded games so the
// profile-driven history / leaderboard / deleted-profile behavior can be
// exercised without hand-creating accounts. Stable ids keep re-seeding from
// duplicating them. Dev-only.
const DEBUG_PROFILES: { id: string; name: string }[] = [
  { id: 'debug-anna', name: 'Anna' },
  { id: 'debug-ben', name: 'Ben' },
  { id: 'debug-clara', name: 'Clara' },
  { id: 'debug-david', name: 'David' },
  { id: 'debug-emma', name: 'Emma' },
  { id: 'debug-felix', name: 'Felix' },
]

// Ensure every debug profile exists (upsert by stable id — idempotent across
// repeated seeding), returning the current roster.
function ensureDebugProfiles(): Profile[] {
  return DEBUG_PROFILES.map(({ id, name }) => {
    const existing = getProfile(id)
    if (existing) return existing
    const profile: Profile = { id, name, createdAt: Date.now() }
    upsertProfile(profile)
    return profile
  })
}

// Seed 10 games into history, spread over the past ~10 days. Each game gets a
// random 2–6 players drawn from the predefined debug profiles (so results link
// to real, editable/deletable profiles). Appends to any existing records.
// Intended for dev use only.
export function seedDebugHistory() {
  const now = Date.now()
  const day = 24 * 60 * 60 * 1000
  const roster = ensureDebugProfiles()
  const seeded: GameRecord[] = []

  for (let g = 0; g < 10; g++) {
    // Random distinct subset of 2–6 profiles from the roster.
    const players = [...roster].sort(() => Math.random() - 0.5).slice(0, randInt(2, 6))
    const totals = players.map((profile) => {
      const scores = randomScores()
      return { profile, scores, total: calcGrandTotal(scores) }
    })
    const ranked = [...totals].sort((a, b) => b.total - a.total)
    let place = 1
    const id = makeId()
    const results: GameResult[] = ranked.map((r, i) => {
      if (i > 0 && r.total < ranked[i - 1].total) place = i + 1
      return { name: r.profile.name, total: r.total, place, profileId: r.profile.id, avatar: r.profile.avatar }
    })
    // Store scorecards under the per-game key, keeping the list record light.
    saveGameBoard(id, ranked.map((r) => r.scores))
    seeded.push({
      id,
      finishedAt: now - (10 - g) * day + randInt(0, day - 1),
      virtualDice: false,
      hasBoard: true,
      results,
    })
  }

  save([...loadHistory(), ...seeded])
}
