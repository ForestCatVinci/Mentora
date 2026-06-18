import { useState } from 'react'
import { api, Post } from '../lib/api'
import DatePicker from './DatePicker'
import { X, Link } from 'lucide-react'

interface Props {
  post: Post
  onSave: (updated: Post) => void
  onClose: () => void
}

export default function EditPostModal({ post, onSave, onClose }: Props) {
  const [title, setTitle] = useState(post.title)
  const [description, setDescription] = useState(post.description ?? '')
  const [link, setLink] = useState(post.link ?? '')
  const [dateType, setDateType] = useState<'deadline' | 'period'>(
    post.end_date ? 'period' : 'deadline'
  )
  const [deadline, setDeadline] = useState(post.deadline_date ?? '')
  const [endDate, setEndDate] = useState(post.end_date ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      const updated = await api.updatePost(post.id, {
        title,
        description,
        link: link || null,
        deadline_date: deadline || null,
        end_date: dateType === 'period' ? (endDate || null) : null,
      })
      onSave(updated)
    } catch (e: any) {
      setError(e.message || 'Ошибка сохранения')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Редактировать пост</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2 rounded-xl">{error}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Название</label>
            <input className="input" value={title} onChange={e => setTitle(e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Описание</label>
            <textarea
              className="input min-h-[120px] resize-y"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Дата</label>
            <div className="flex gap-2 mb-3">
              {(['deadline', 'period'] as const).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setDateType(t)}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium border-2 transition-all duration-150 ${
                    dateType === t
                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  {t === 'deadline' ? 'Дедлайн' : 'Период'}
                </button>
              ))}
            </div>
            {dateType === 'deadline' ? (
              <DatePicker value={deadline} onChange={setDeadline} placeholder="До какого числа" />
            ) : (
              <div className="flex items-center gap-2">
                <DatePicker value={deadline} onChange={setDeadline} placeholder="С какого" />
                <span className="text-gray-400 text-sm shrink-0">—</span>
                <DatePicker value={endDate} onChange={setEndDate} placeholder="По какое" />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Ссылка</label>
            <div className="relative">
              <Link size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                className="input pl-9"
                type="url"
                value={link}
                onChange={e => setLink(e.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 px-6 pb-6">
          <button className="btn-secondary flex-1" onClick={onClose}>Отмена</button>
          <button className="btn-primary flex-1" onClick={handleSave} disabled={saving || !title.trim()}>
            {saving ? 'Сохраняем...' : 'Сохранить'}
          </button>
        </div>
      </div>
    </div>
  )
}
