import { useState } from 'react'
import { Bookmark, BookmarkCheck, Calendar, ExternalLink, Pencil, Trash2 } from 'lucide-react'
import { api, Post } from '../lib/api'
import TagBadge from './TagBadge'
import EditPostModal from './EditPostModal'
import { useLang } from '../contexts/LangContext'
import type { TKey } from '../lib/i18n'

interface Props {
  post: Post
  currentUserId?: string
  onToggleSave?: (postId: string, currentlySaved: boolean) => void
  onUpdate?: (updated: Post) => void
  onDelete?: (postId: string) => void
}

function DateBadge({ post }: { post: Post }) {
  const { t } = useLang()
  const locale = t('post.locale' as TKey)

  const fmt = (d: string) => new Date(d).toLocaleDateString(locale, { day: 'numeric', month: 'short' })

  if (post.deadline_date && post.end_date) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
        <Calendar size={11} />
        {fmt(post.deadline_date)} — {fmt(post.end_date)}
      </span>
    )
  }
  if (post.deadline_date) {
    const daysLeft = Math.ceil((new Date(post.deadline_date).getTime() - Date.now()) / 86400000)
    if (daysLeft < 0) return null
    if (daysLeft <= 7)
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
          <Calendar size={11} /> {t('post.daysLeft', { n: String(daysLeft) })}
        </span>
      )
    if (daysLeft <= 42)
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
          <Calendar size={11} /> {t('post.daysLeft', { n: String(daysLeft) })}
        </span>
      )
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
        <Calendar size={11} /> {t('post.until', { date: fmt(post.deadline_date) })}
      </span>
    )
  }
  return null
}

export default function PostCard({ post, currentUserId, onToggleSave, onUpdate, onDelete }: Props) {
  const { t } = useLang()
  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const isOwner = !!currentUserId && currentUserId === post.created_by

  const handleDelete = async () => {
    setDeleting(true)
    await api.deletePost(post.id)
    onDelete?.(post.id)
  }

  return (
    <>
      <article className="card overflow-hidden animate-fade-in group">
        {post.image_url ? (
          <div className="aspect-video overflow-hidden bg-gray-100">
            <img
              src={post.image_url}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        ) : (
          <div className="aspect-video bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
            <span className="text-4xl">📚</span>
          </div>
        )}

        <div className="p-5">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex flex-wrap gap-1.5">
              {post.category && <TagBadge tag={post.category} variant="category" />}
              <DateBadge post={post} />
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {isOwner && (
                <>
                  <button
                    onClick={() => setEditing(true)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </>
              )}
              {onToggleSave && (
                <button
                  onClick={() => onToggleSave(post.id, !!post.is_saved)}
                  className="p-1.5 rounded-lg hover:bg-primary-50 text-gray-400 hover:text-primary-600 transition-colors"
                >
                  {post.is_saved ? <BookmarkCheck size={18} className="text-primary-600" /> : <Bookmark size={18} />}
                </button>
              )}
            </div>
          </div>

          <h3 className="font-semibold text-gray-900 text-base leading-snug mb-1.5 line-clamp-2">
            {post.title}
          </h3>

          {post.summary_ru && (
            <p className="text-sm text-gray-500 leading-relaxed mb-3 line-clamp-2">{post.summary_ru}</p>
          )}

          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {post.tags.slice(0, 3).map(tag => <TagBadge key={tag} tag={tag} />)}
            </div>
          )}

          {post.link && (
            <a
              href={post.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
            >
              <ExternalLink size={14} />
              {t('post.details')}
            </a>
          )}

          {confirmDelete && (
            <div className="mt-3 flex items-center gap-3 bg-red-50 rounded-xl px-3 py-2">
              <p className="text-sm text-red-600 flex-1">{t('post.deleteQ')}</p>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="text-sm font-semibold text-red-600 hover:text-red-700"
              >
                {deleting ? '...' : t('post.yes')}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                {t('post.no')}
              </button>
            </div>
          )}
        </div>
      </article>

      {editing && (
        <EditPostModal
          post={post}
          onSave={(updated) => { onUpdate?.(updated); setEditing(false) }}
          onClose={() => setEditing(false)}
        />
      )}
    </>
  )
}
