import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../lib/api'
import { UserProfile } from '../../lib/api'
import { BookOpen, Image, Upload } from 'lucide-react'

interface Props {
  user: UserProfile
}

const GRADES = [8, 9, 10, 11]

export default function CreateCourse({ user }: Props) {
  const navigate = useNavigate()
  const fileRef = useRef<HTMLInputElement>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner')
  const [gradeRange, setGradeRange] = useState<number[]>([])
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const toggleGrade = (g: number) =>
    setGradeRange(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g].sort())

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const form = new FormData()
      form.append('title', title)
      form.append('created_by', user.id)
      if (description) form.append('description', description)
      if (category) form.append('category', category)
      form.append('difficulty', difficulty)
      form.append('grade_range', JSON.stringify(gradeRange))
      if (imageFile) form.append('image', imageFile)
      const course = await api.createCourse(form)
      navigate(`/admin/courses/${course.id}/edit`)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Ошибка создания курса')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <BookOpen size={22} className="text-primary-600" />
        Создать курс
      </h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Название *</label>
          <input className="input" value={title} onChange={e => setTitle(e.target.value)} required placeholder="Название курса" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Описание</label>
          <textarea className="input min-h-[100px] resize-y" value={description} onChange={e => setDescription(e.target.value)} placeholder="Чему научит этот курс..." />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Категория</label>
            <input className="input" value={category} onChange={e => setCategory(e.target.value)} placeholder="Математика, CS..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Сложность</label>
            <select className="input" value={difficulty} onChange={e => setDifficulty(e.target.value as typeof difficulty)}>
              <option value="beginner">Начальный</option>
              <option value="intermediate">Средний</option>
              <option value="advanced">Продвинутый</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Для классов</label>
          <div className="flex gap-2">
            {GRADES.map(g => (
              <button
                key={g}
                type="button"
                onClick={() => toggleGrade(g)}
                className={`w-12 h-12 rounded-xl border-2 font-semibold text-sm transition-all duration-150 ${
                  gradeRange.includes(g)
                    ? 'border-primary-600 bg-primary-600 text-white'
                    : 'border-gray-200 text-gray-600 hover:border-primary-300'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Обложка</label>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
          {imagePreview ? (
            <div className="relative rounded-xl overflow-hidden aspect-video cursor-pointer" onClick={() => fileRef.current?.click()}>
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <p className="text-white text-sm font-medium flex items-center gap-2"><Upload size={16} /> Заменить</p>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-200 hover:border-primary-300 rounded-xl py-8 flex flex-col items-center gap-2 text-gray-400 hover:text-primary-500 transition-all duration-150"
            >
              <Image size={24} />
              <span className="text-sm">Загрузить обложку</span>
            </button>
          )}
        </div>

        <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
          {loading ? 'Создаём...' : 'Создать и добавить уроки →'}
        </button>
      </form>
    </div>
  )
}
