import { useEffect, useState, useMemo } from 'react'
import { api, Post } from '../lib/api'
import PostCard from '../components/PostCard'
import { useAuth } from '../hooks/useAuth'
import { Search, SlidersHorizontal, Compass, X } from 'lucide-react'

const CATEGORIES = [
  { value: 'competition',    label: 'Конкурсы' },
  { value: 'scholarship',    label: 'Стипендии' },
  { value: 'summer_program', label: 'Летние программы' },
  { value: 'hackathon',      label: 'Хакатоны' },
  { value: 'olympiad',       label: 'Олимпиады' },
  { value: 'internship',     label: 'Стажировки' },
  { value: 'research',       label: 'Исследования' },
  { value: 'event',          label: 'Мероприятия' },
]

const GRADES = [8, 9, 10, 11]

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-card">
      <div className="aspect-video skeleton" />
      <div className="p-5 space-y-3">
        <div className="h-4 skeleton rounded-full w-1/3" />
        <div className="h-5 skeleton rounded-full w-3/4" />
        <div className="h-4 skeleton rounded-full w-full" />
      </div>
    </div>
  )
}

function matchesCategory(post: Post, cat: string): boolean {
  if (!cat) return true
  if (post.category === cat) return true
  // fall back to tags in case AI hasn't categorized yet
  return post.tags.some(t => t.toLowerCase().replace(/[\s_-]/g, '') === cat.replace(/[\s_-]/g, ''))
}

function matchesSearch(post: Post, q: string): boolean {
  if (!q) return true
  const lq = q.toLowerCase()
  return (
    post.title.toLowerCase().includes(lq) ||
    (post.description ?? '').toLowerCase().includes(lq) ||
    post.tags.some(t => t.toLowerCase().includes(lq))
  )
}

function matchesGrade(post: Post, grade: number): boolean {
  if (!grade) return true
  return post.grade_range.includes(grade)
}

export default function Opportunities() {
  const { user } = useAuth()
  const [allPosts, setAllPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [grade, setGrade] = useState(0)

  useEffect(() => {
    api.getPosts({ userId: user?.id })
      .then(setAllPosts)
      .finally(() => setLoading(false))
  }, [user?.id])

  const filtered = useMemo(() =>
    allPosts.filter(p =>
      matchesCategory(p, category) &&
      matchesSearch(p, search) &&
      matchesGrade(p, grade)
    ),
    [allPosts, category, search, grade]
  )

  const toggleSave = async (postId: string, currentlySaved: boolean) => {
    if (!user) return
    if (currentlySaved) {
      await api.unsavePost(postId, user.id)
    } else {
      await api.savePost(postId, user.id)
    }
    setAllPosts(prev =>
      prev.map(p =>
        p.id === postId
          ? { ...p, is_saved: !currentlySaved, saves_count: p.saves_count + (currentlySaved ? -1 : 1) }
          : p
      )
    )
  }

  const activeFilters = (category ? 1 : 0) + (grade ? 1 : 0)
  const clearAll = () => { setCategory(''); setGrade(0); setSearch('') }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <Compass size={24} className="text-primary-600" />
        Возможности
      </h1>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          className="input pl-9 pr-9"
          placeholder="Поиск по названию, описанию, тегам..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && (
          <button onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Category chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-3 scrollbar-hide">
        <button
          onClick={() => setCategory('')}
          className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
            category === ''
              ? 'bg-primary-600 text-white border-primary-600'
              : 'border-gray-200 text-gray-600 hover:border-primary-300 hover:text-primary-600'
          }`}
        >
          Все
        </button>
        {CATEGORIES.map(c => (
          <button
            key={c.value}
            onClick={() => setCategory(prev => prev === c.value ? '' : c.value)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
              category === c.value
                ? 'bg-primary-600 text-white border-primary-600'
                : 'border-gray-200 text-gray-600 hover:border-primary-300 hover:text-primary-600'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Grade chips + clear */}
      <div className="flex items-center gap-2 mb-6">
        <span className="text-xs text-gray-400 font-medium shrink-0">Класс:</span>
        <div className="flex gap-1.5">
          {GRADES.map(g => (
            <button
              key={g}
              onClick={() => setGrade(prev => prev === g ? 0 : g)}
              className={`w-9 h-9 rounded-xl text-sm font-semibold border-2 transition-all ${
                grade === g
                  ? 'border-primary-600 bg-primary-600 text-white'
                  : 'border-gray-200 text-gray-600 hover:border-primary-300'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
        {activeFilters > 0 && (
          <button
            onClick={clearAll}
            className="ml-auto flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 transition-colors"
          >
            <X size={12} />
            Сбросить
          </button>
        )}
      </div>

      {/* Results count */}
      {!loading && (search || category || grade > 0) && (
        <p className="text-sm text-gray-400 mb-4">
          Найдено: <span className="font-semibold text-gray-700">{filtered.length}</span>
        </p>
      )}

      {loading && (
        <div className="grid md:grid-cols-2 gap-5">
          {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-20">
          <SlidersHorizontal size={48} className="mx-auto text-gray-200 mb-4" />
          <h3 className="font-semibold text-gray-700 mb-2">Ничего не нашлось</h3>
          <p className="text-sm text-gray-400">
            {activeFilters > 0 || search ? 'Попробуй изменить фильтры' : 'Пока нет опубликованных возможностей'}
          </p>
          {(activeFilters > 0 || search) && (
            <button onClick={clearAll} className="btn-secondary mt-4 text-sm">
              Сбросить фильтры
            </button>
          )}
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="grid md:grid-cols-2 gap-5">
          {filtered.map(post => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={user?.id}
              onToggleSave={toggleSave}
              onUpdate={updated => setAllPosts(prev => prev.map(p => p.id === updated.id ? updated : p))}
              onDelete={postId => setAllPosts(prev => prev.filter(p => p.id !== postId))}
            />
          ))}
        </div>
      )}
    </div>
  )
}
