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
  onSelect: (profile: Profile) => void
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
      className={`${dims} rounded-full bg-indigo-600 dark:bg-indigo-500 text-white font-bold flex items-center justify-center flex-shrink-0`}
    >
      {initial}
    </span>
  )
}

// A working draft while creating/editing a profile.
type Draft = { id: string | null; name: string; avatar?: string }

export function ProfilePickerModal({ onSelect, onClose }: Props) {
  const { t } = useTranslation()
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
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {draft ? (
          /* ---- Create / edit form ---- */
          <>
            <div className="p-5 pb-3 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {draft.id ? t.editProfile : t.newProfile}
              </h2>
            </div>

            <div className="overflow-y-auto p-5 flex flex-col gap-4">
              {/* Avatar + upload */}
              <div className="flex items-center gap-4">
                <Avatar profile={{ name: draft.name, avatar: draft.avatar }} size="lg" />
                <div className="flex flex-col gap-2">
                  <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-sm font-semibold cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-900/60 transition-colors">
                    📷 {t.uploadPhoto}
                    <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
                  </label>
                  {draft.avatar && (
                    <button
                      type="button"
                      onClick={() => setDraft({ ...draft, avatar: undefined })}
                      className="text-xs text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 text-left transition-colors"
                    >
                      {t.removePhoto}
                    </button>
                  )}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  {t.profileName}
                </label>
                <input
                  type="text"
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value.slice(0, 20) })}
                  placeholder={t.profileNamePlaceholder}
                  maxLength={20}
                  autoFocus
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition"
                />
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex gap-3">
              <button
                type="button"
                onClick={() => setDraft(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={saveDraft}
                disabled={draft.name.trim().length === 0}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 dark:bg-indigo-500 text-white font-semibold text-sm hover:bg-indigo-700 dark:hover:bg-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {t.save}
              </button>
            </div>
          </>
        ) : (
          /* ---- Profile list ---- */
          <>
            <div className="p-5 pb-3 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">{t.chooseProfile}</h2>
            </div>

            <div className="overflow-y-auto p-3 flex flex-col gap-2">
              {profiles.length === 0 ? (
                <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-8">{t.noProfilesYet}</p>
              ) : (
                profiles.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50"
                  >
                    <button
                      type="button"
                      onClick={() => onSelect(p)}
                      className="flex items-center gap-3 flex-1 min-w-0 text-left"
                    >
                      <Avatar profile={p} />
                      <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {p.name}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => startEdit(p)}
                      aria-label={t.editProfile}
                      className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                    >
                      ✏️
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(p)}
                      aria-label={t.deleteProfile}
                      className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    >
                      🗑️
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex flex-col gap-2">
              <button
                type="button"
                onClick={startNew}
                className="w-full py-2.5 rounded-xl bg-indigo-600 dark:bg-indigo-500 text-white font-semibold text-sm hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
              >
                + {t.newProfile}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
              >
                {t.cancel}
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
              className="w-full max-w-xs bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-5 flex flex-col gap-4"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {t.deleteProfileConfirm(confirmDelete.name)}
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
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
