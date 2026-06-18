import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, Post } from '../../lib/api'
import { UserProfile } from '../../lib/api'
import DatePicker from '../../components/DatePicker'
import { Upload, CheckCircle, Image, Link } from 'lucide-react'

interface Props {
  user: UserProfile
}

export default function CreatePost({ user }: Props) {
  const navigate = useNavigate()
  const fileRef = useRef<HTMLInputElement>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dateType, setDateType] = useState<'deadline' | 'period'>('deadline')
  const [deadline, setDeadline] = useState('')
  const [endDate, setEndDate] = useState('')
  const [link, setLink] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Post | null>(null)
  const [error, setError] = useState('')

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const resetForm = () => {
    setResult(null); setTitle(''); setDescription(''); setDeadline('')
    setEndDate(''); setLink(''); setImageFile(null); setImagePreview(null)
    setDateType('deadline')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const form = new FormData()
      form.append('title', title)
      form.append('description', description)
      form.append('created_by', user.id)
      if (link.trim()) form.append('link', link.trim())
      if (imageFile) form.append('image', imageFile)
      if (dateType === 'deadline' && deadline) {
        form.append('deadline_date', deadline)
      } else if (dateType === 'period') {
        if (deadline) form.append('deadline_date', deadline)
        if (endDate) form.append('end_date', endDate)
      }
      const post = await api.createPost(form)
      setResult(post)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Ошибка создания поста')
    } finally {
      setLoading(false)
    }
  }

  if (result) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <CheckCircle size={56} className="mx-auto text-green-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Пост опубликован!</h2>
        <p className="text-gray-500 mb-6">Пост уже виден в ленте. AI добавит теги в фоне.</p>

        <div className="card p-5 text-left mb-6">
          <h3 className="font-semibold text-gray-900 mb-2">{result.title}</h3>
          <p className="text-sm text-gray-500">{result.description?.slice(0, 120)}{(result.description?.length ?? 0) > 120 ? '...' : ''}</p>
        </div>

        <div className="flex gap-3 justify-center">
          <button className="btn-secondary" onClick={resetForm}>Создать ещё</button>
          <button className="btn-primary" onClick={() => navigate('/feed')}>Перейти в ленту</button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Создать пост</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Название *</label>
          <input
            className="input"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Например: MIT Summer Science Program 2025"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Описание *</label>
          <textarea
            className="input min-h-[140px] resize-y"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Подробное описание, требования, как подать заявку..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Дата</label>
          <div className="flex gap-2 mb-3">
            <button
              type="button"
              onClick={() => setDateType('deadline')}
              className={`flex-1 py-2 rounded-xl text-sm font-medium border-2 transition-all duration-150 ${
                dateType === 'deadline'
                  ? 'border-primary-600 bg-primary-50 text-primary-700'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              Дедлайн
            </button>
            <button
              type="button"
              onClick={() => setDateType('period')}
              className={`flex-1 py-2 rounded-xl text-sm font-medium border-2 transition-all duration-150 ${
                dateType === 'period'
                  ? 'border-primary-600 bg-primary-50 text-primary-700'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              Период
            </button>
          </div>

          {dateType === 'deadline' && (
            <DatePicker value={deadline} onChange={setDeadline} placeholder="До какого числа" />
          )}

          {dateType === 'period' && (
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Изображение</label>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />

          {imagePreview ? (
            <div className="relative rounded-xl overflow-hidden aspect-video bg-gray-100 cursor-pointer" onClick={() => fileRef.current?.click()}>
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-150">
                <p className="text-white text-sm font-medium flex items-center gap-2"><Upload size={16} /> Заменить</p>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-200 hover:border-primary-300 rounded-xl py-10 flex flex-col items-center gap-2 text-gray-400 hover:text-primary-500 transition-all duration-150"
            >
              <Image size={28} />
              <span className="text-sm font-medium">Загрузить изображение</span>
              <span className="text-xs">PNG, JPG до 10MB</span>
            </button>
          )}
        </div>

        <button type="submit" className="btn-primary w-full py-3 flex items-center justify-center gap-2" disabled={loading}>
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Публикуем...
            </>
          ) : (
            'Опубликовать'
          )}
        </button>
      </form>
    </div>
  )
}
