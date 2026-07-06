// A saved player profile. Profiles let recurring players carry a stable identity
// (and optional avatar) across games. Persisted to localStorage under
// `knueffl-profiles` (see src/utils/profiles.ts).
export interface Profile {
  id: string
  name: string
  // Compressed square avatar as a JPEG data URL, or undefined when none is set.
  avatar?: string
  createdAt: number
}

// One player slot as configured on the setup screen. `profileId`/`avatar` are
// carried onto the created `Player` when a saved profile was chosen; a slot with
// only a `name` is a lightweight ad-hoc entry.
export interface PlayerSetup {
  name: string
  profileId?: string
  avatar?: string
}
