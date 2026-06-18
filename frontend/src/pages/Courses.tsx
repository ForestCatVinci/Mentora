import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, Course, UserProfile } from '../lib/api'
import CourseCard from '../components/CourseCard'
import { BookOpen } from 'lucide-react'
import { useLang } from '../contexts/LangContext'

interface Props {
  user: UserProfile
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-card">
      <div className="aspect-video skeleton" />
      <div className="p-5 space-y-3">
        <div className="h-4 skeleton rounded-full w-1/4" />
        <div className="h-5 skeleton rounded-full w-3/4" />
        <div className="h-4 skeleton rounded-full w-full" />
        <div className="h-2 skeleton rounded-full w-full" />
        <div className="h-9 skeleton rounded-xl" />
      </div>
    </div>
  )
}

export default function Courses({ user }: Props) {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { t } = useLang()

  useEffect(() => {
    api.getCourses(user.id).then(setCourses).finally(() => setLoading(false))
  }, [user.id])

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <BookOpen size={24} className="text-primary-600" />
        {t('courses.title')}
      </h1>

      {loading && (
        <div className="grid md:grid-cols-2 gap-5">
          {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
        </div>
      )}

      {!loading && courses.length === 0 && (
        <div className="text-center py-20">
          <BookOpen size={48} className="mx-auto text-gray-200 mb-4" />
          <h3 className="font-semibold text-gray-700 mb-2">{t('courses.empty')}</h3>
          <p className="text-sm text-gray-400">{t('courses.hint')}</p>
        </div>
      )}

      {!loading && courses.length > 0 && (
        <div className="grid md:grid-cols-2 gap-5">
          {courses.map(course => (
            <CourseCard
              key={course.id}
              course={course}
              onClick={() => navigate(`/courses/${course.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
