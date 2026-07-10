import { useState } from 'react'
import type { Profile } from '../types/profile'
import {
  loadProfiles,
  upsertProfile,
  removeProfile,
  makeProfileId,
  processAvatarFile,
} from '../utils/profiles'
import { useTranslation } from '../hooks/useLanguage'

interface Props {
  // When provided, the modal is a setup-slot PICKER: tapping a profile assigns it.
  // When omitted, it's the profile MANAGER (Task 41): tapping a profile edits it.
  onSelect?: (profile: Profile) => void
  // Profile IDs already assigned to other slots this game — shown but not selectable (Task 46).
  disabledProfileIds?: string[]
  onClose: () => void
}

// Circular avatar (image if present, else the name's initial on a colored disc).
function Avatar({ profile, size = 'md' }: { profile: { name: string; avatar?: string }; size?: 'md' | 'lg' }) {
  const dims = size === 'lg' ? 'w-16 h-16 text-2xl' : 'w-10 h-10 text-sm'
  if (profile.avatar) {
    return <img src={profile.avatar} alt="" className={`${dims} rounded-full object-cover flex-shrink-0`} />
  }
  const initial = profile.name.trim().slice(0, 2).toUpperCase() || '?'
  return (
    <span
      className={`${dims} rounded-full bg-teal-600 dark:bg-teal-600 text-white font-bold flex items-center justify-center flex-shrink-0`}
    >
      {initial}
    </span>
  )
}

// A working draft while creating/editing a profile.
type Draft = { id: string | null; name: string; avatar?: string }

export function ProfilePickerModal({ onSelect, disabledProfileIds, onClose }: Props) {
  const { t } = useTranslation()
  // No onSelect → this is the manager (edit/create/delete), not a slot picker.
  const managing = !onSelect
  const disabled = new Set(disabledProfileIds)
  const [profiles, setProfiles] = useState<Profile[]>(() => loadProfiles())
  // null = list view; otherwise the form is shown for this draft.
  const [draft, setDraft] = useState<Draft | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<Profile | null>(null)

  function startNew() {
    setDraft({ id: null, name: '', avatar: undefined })
  }

  function startEdit(p: Profile) {
    setDraft({ id: p.id, name: p.name, avatar: p.avatar })
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-selecting the same file
    if (!file || !draft) return
    try {
      const avatar = await processAvatarFile(file)
      setDraft({ ...draft, avatar })
    } catch {
      // Ignore invalid image; keep the current avatar.
    }
  }

  function saveDraft() {
    if (!draft) return
    const name = draft.name.trim()
    if (!name) return
    const existing = draft.id ? profiles.find((p) => p.id === draft.id) : undefined
    const profile: Profile = {
      id: draft.id ?? makeProfileId(),
      name,
      avatar: draft.avatar,
      createdAt: existing?.createdAt ?? Date.now(),
    }
    upsertProfile(profile)
    setProfiles(loadProfiles())
    setDraft(null)
  }

  function doDelete(p: Profile) {
    removeProfile(p.id)
    setProfiles(loadProfiles())
    setConfirmDelete(null)
    setDraft(null) // back to the refreshed list
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-zinc-700 flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {draft ? (
          /* ---- Create / edit form ---- */
          <>
            <div className="p-5 pb-3 border-b border-slate-200 dark:border-zinc-700 flex items-center justify-between gap-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                {draft.id ? t.editProfile : t.newProfile}
              </h2>
              {/* Delete only when editing an existing profile; returns to the list after. */}
              {draft.id && (
                <button
                  type="button"
                  onClick={() => {
                    const p = profiles.find((x) => x.id === draft.id)
                    if (p) setConfirmDelete(p)
                  }}
                  aria-label={t.deleteProfile}
                  className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 dark:text-zinc-400 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                >
                  🗑️
                </button>
              )}
            </div>

            <div className="overflow-y-auto p-5 flex flex-col gap-4">
              {/* Avatar + upload */}
              <div className="flex items-center gap-4">
                <Avatar profile={{ name: draft.name, avatar: draft.avatar }} size="lg" />
                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap gap-2">
                    {/* Camera: `capture` opens it directly on mobile; degrades to a file dialog on desktop. */}
                    <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-400 text-sm font-semibold cursor-pointer hover:bg-teal-200 dark:hover:bg-teal-900/60 transition-colors">
                      📷 {t.takePhoto}
                      <input type="file" accept="image/*" capture="environment" onChange={handleFile} className="hidden" />
                    </label>
                    {/* No `capture` → photo library / file picker. */}
                    <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-400 text-sm font-semibold cursor-pointer hover:bg-teal-200 dark:hover:bg-teal-900/60 transition-colors">
                      🖼️ {t.choosePhoto}
                      <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
                    </label>
                  </div>
                  {draft.avatar && (
                    <button
                      type="button"
                      onClick={() => setDraft({ ...draft, avatar: undefined })}
                      className="text-xs text-slate-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 text-left transition-colors"
                    >
                      {t.removePhoto}
                    </button>
                  )}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                  {t.profileName}
                </label>
                <input
                  type="text"
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value.slice(0, 20) })}
                  placeholder={t.profileNamePlaceholder}
                  maxLength={20}
                  autoFocus
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-600 bg-slate-50 dark:bg-zinc-700/50 text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-zinc-700 flex gap-3">
              <button
                type="button"
                onClick={() => setDraft(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-600 bg-slate-50 dark:bg-zinc-700 text-slate-700 dark:text-zinc-200 font-semibold text-sm hover:bg-slate-100 dark:hover:bg-zinc-600 transition-colors"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={saveDraft}
                disabled={draft.name.trim().length === 0}
                className="flex-1 py-2.5 rounded-xl bg-teal-600 dark:bg-teal-600 text-white font-semibold text-sm hover:bg-teal-700 dark:hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {t.save}
              </button>
            </div>
          </>
        ) : (
          /* ---- Profile list ---- */
          <>
            <div className="p-5 pb-3 border-b border-slate-200 dark:border-zinc-700">
              <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                {managing ? t.manageProfiles : t.chooseProfile}
              </h2>
            </div>

            <div className="overflow-y-auto p-3 flex flex-col gap-2">
              {profiles.length === 0 ? (
                <p className="text-sm text-slate-400 dark:text-zinc-500 text-center py-8">{t.noProfilesYet}</p>
              ) : (
                profiles.map((p) => {
                  // In picker mode, a profile already used by another slot can't be picked again.
                  const isDisabled = disabled.has(p.id)
                  return (
                    /* Rows carry only the entry: tap assigns (picker) or edits (manage). */
                    <button
                      key={p.id}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => (onSelect ? onSelect(p) : startEdit(p))}
                      aria-label={managing ? t.editProfile : t.chooseProfile}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-600 bg-slate-50 dark:bg-zinc-700/50 text-left hover:bg-slate-100 dark:hover:bg-zinc-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-slate-50 dark:disabled:hover:bg-zinc-700/50"
                    >
                      <Avatar profile={p} />
                      <span className="flex-1 min-w-0 text-sm font-semibold text-slate-800 dark:text-zinc-200 truncate">
                        {p.name}
                      </span>
                      {isDisabled && (
                        <span className="flex-shrink-0 text-xs font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wide">
                          {t.profileInGame}
                        </span>
                      )}
                    </button>
                  )
                })
              )}
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-zinc-700 flex flex-col gap-2">
              <button
                type="button"
                onClick={startNew}
                className="w-full py-2.5 rounded-xl bg-teal-600 dark:bg-teal-600 text-white font-semibold text-sm hover:bg-teal-700 dark:hover:bg-teal-700 transition-colors"
              >
                + {t.newProfile}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-zinc-600 bg-slate-50 dark:bg-zinc-700 text-slate-700 dark:text-zinc-200 font-semibold text-sm hover:bg-slate-100 dark:hover:bg-zinc-600 transition-colors"
              >
                {managing ? t.close : t.cancel}
              </button>
            </div>
          </>
        )}

        {/* Delete confirmation */}
        {confirmDelete && (
          <div
            className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 rounded-2xl px-6"
            onClick={() => setConfirmDelete(null)}
          >
            <div
              className="w-full max-w-xs bg-white dark:bg-zinc-800 rounded-2xl shadow-xl border border-slate-200 dark:border-zinc-700 p-5 flex flex-col gap-4"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-sm font-semibold text-slate-800 dark:text-zinc-200">
                {t.deleteProfileConfirm(confirmDelete.name)}
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-zinc-600 bg-slate-50 dark:bg-zinc-700 text-slate-700 dark:text-zinc-200 font-semibold text-sm hover:bg-slate-100 dark:hover:bg-zinc-600 transition-colors"
                >
                  {t.cancel}
                </button>
                <button
                  type="button"
                  onClick={() => doDelete(confirmDelete)}
                  className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-colors"
                >
                  {t.delete}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
