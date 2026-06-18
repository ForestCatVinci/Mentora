import { BookOpen, PlayCircle, CheckCircle } from 'lucide-react'
import { Course } from '../lib/api'
import { useLang } from '../contexts/LangContext'

interface Props {
  course: Course
  onClick?: () => void
}

const difficultyColor: Record<string, string> = {
  beginner: 'bg-green-100 text-green-700',
  intermediate: 'bg-yellow-100 text-yellow-700',
  advanced: 'bg-red-100 text-red-700',
}

export default function CourseCard({ course, onClick }: Props) {
  const { t } = useLang()

  const difficultyLabel: Record<string, string> = {
    beginner: t('courses.beginner'),
    intermediate: t('courses.intermediate'),
    advanced: t('courses.advanced'),
  }

  const allLessons = course.sections?.flatMap(s => s.lessons) ?? []
  const total = allLessons.length
  const completedIds = new Set(course.completed_lessons ?? [])
  const completed = allLessons.filter(l => completedIds.has(l.id)).length
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0
  const isEnrolled = course.enrolled ?? false

  return (
    <article
      className="card overflow-hidden animate-fade-in group cursor-pointer"
      onClick={onClick}
    >
      <div className="aspect-video overflow-hidden bg-gray-100 relative">
        {course.image_url ? (
          <img
            src={course.image_url}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-primary-200 flex items-center justify-center">
            <BookOpen size={40} className="text-primary-400" />
          </div>
        )}
        {isEnrolled && progress === 100 && (
          <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
            <CheckCircle size={11} />
            {t('courses.done')}
          </div>
        )}
        {isEnrolled && progress > 0 && progress < 100 && (
          <div className="absolute top-2 right-2 bg-primary-600 text-white text-xs font-bold px-2 py-1 rounded-full">
            {progress}%
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${difficultyColor[course.difficulty]}`}>
            {difficultyLabel[course.difficulty]}
          </span>
          {course.category && (
            <span className="text-xs text-gray-400">{course.category}</span>
          )}
          {total > 0 && (
            <span className="text-xs text-gray-400 ml-auto">{total} {t('courses.lessons')}</span>
          )}
        </div>

        <h3 className="font-semibold text-gray-900 mb-1.5 line-clamp-2 group-hover:text-primary-700 transition-colors">
          {course.title}
        </h3>
        {course.description && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-3">{course.description}</p>
        )}

        {isEnrolled && total > 0 && (
          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>{completed} / {total} {t('courses.lessons')}</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-500 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <div className={`flex items-center justify-center gap-2 text-sm font-semibold py-2 rounded-xl transition-all ${
          isEnrolled
            ? 'bg-primary-50 text-primary-700 group-hover:bg-primary-100'
            : 'bg-gray-50 text-gray-600 group-hover:bg-primary-50 group-hover:text-primary-700'
        }`}>
          <PlayCircle size={16} />
          {isEnrolled ? (progress > 0 ? t('courses.cont') : t('courses.start')) : t('courses.open')}
        </div>
      </div>
    </article>
  )
}
