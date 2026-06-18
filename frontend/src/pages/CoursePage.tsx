import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api, Course, Lesson, UserProfile } from '../lib/api'
import {
  BookOpen, PlayCircle, CheckCircle, Circle, ChevronLeft,
  Lock, Edit2, Loader2
} from 'lucide-react'

interface Props {
  user: UserProfile
}

const difficultyLabel: Record<string, string> = {
  beginner: 'Начальный',
  intermediate: 'Средний',
  advanced: 'Продвинутый',
}
const difficultyColor: Record<string, string> = {
  beginner: 'bg-green-100 text-green-700',
  intermediate: 'bg-yellow-100 text-yellow-700',
  advanced: 'bg-red-100 text-red-700',
}

function getYoutubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/)
  return m ? m[1] : null
}

function VideoPlayer({ url }: { url: string }) {
  const ytId = getYoutubeId(url)
  if (ytId) {
    return (
      <div className="aspect-video w-full bg-black rounded-xl overflow-hidden">
        <iframe
          src={`https://www.youtube.com/embed/${ytId}?rel=0`}
          title="Видеоурок"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      </div>
    )
  }
  return (
    <div className="aspect-video w-full bg-gray-900 rounded-xl flex items-center justify-center">
      <a href={url} target="_blank" rel="noopener noreferrer"
        className="flex items-center gap-2 text-white bg-primary-600 hover:bg-primary-700 px-5 py-3 rounded-xl font-semibold transition-colors">
        <PlayCircle size={20} />
        Открыть видео
      </a>
    </div>
  )
}

export default function CoursePage({ user }: Props) {
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null)
  const [enrolling, setEnrolling] = useState(false)
  const [togglingLesson, setTogglingLesson] = useState<string | null>(null)

  const isCreator = course?.created_by === user.id
  const canEdit = isCreator || user.role === 'admin' || user.role === 'staff'

  useEffect(() => {
    if (!courseId) return
    api.getCourse(courseId, user.id).then(c => {
      setCourse(c)
      const firstLesson = c.sections?.[0]?.lessons?.[0] ?? null
      setActiveLesson(firstLesson)
    }).finally(() => setLoading(false))
  }, [courseId, user.id])

  const allLessons = course?.sections.flatMap(s => s.lessons) ?? []
  const completedIds = new Set(course?.completed_lessons ?? [])
  const totalLessons = allLessons.length
  const completedCount = allLessons.filter(l => completedIds.has(l.id)).length
  const progress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0

  const handleEnroll = async () => {
    if (!course) return
    setEnrolling(true)
    try {
      if (course.enrolled) {
        await api.unenrollCourse(course.id, user.id)
        setCourse(c => c ? { ...c, enrolled: false } : c)
      } else {
        await api.enrollCourse(course.id, user.id)
        setCourse(c => c ? { ...c, enrolled: true } : c)
      }
    } finally {
      setEnrolling(false)
    }
  }

  const toggleComplete = async (lesson: Lesson) => {
    if (!course) return
    setTogglingLesson(lesson.id)
    try {
      const isDone = completedIds.has(lesson.id)
      if (isDone) {
        await api.uncompleteLesson(course.id, lesson.id, user.id)
        setCourse(c => c ? { ...c, completed_lessons: (c.completed_lessons ?? []).filter(id => id !== lesson.id) } : c)
      } else {
        await api.completeLesson(course.id, lesson.id, user.id)
        setCourse(c => c ? { ...c, completed_lessons: [...(c.completed_lessons ?? []), lesson.id] } : c)
      }
    } finally {
      setTogglingLesson(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  if (!course) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <BookOpen size={48} className="mx-auto text-gray-200 mb-4" />
        <h2 className="text-xl font-bold text-gray-700">Курс не найден</h2>
        <button className="btn-secondary mt-4" onClick={() => navigate('/courses')}>
          К курсам
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-5">
        <button onClick={() => navigate('/courses')}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors">
          <ChevronLeft size={16} />
          К курсам
        </button>
        {canEdit && (
          <button
            onClick={() => navigate(`/admin/courses/${course.id}/edit`)}
            className="flex items-center gap-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-xl transition-colors"
          >
            <Edit2 size={14} />
            Редактировать
          </button>
        )}
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        {/* Main content */}
        <div className="min-w-0">
          {/* Video / placeholder */}
          {activeLesson?.video_url ? (
            <VideoPlayer url={activeLesson.video_url} />
          ) : activeLesson ? (
            <div className="aspect-video w-full bg-gradient-to-br from-indigo-100 to-primary-100 rounded-xl flex flex-col items-center justify-center gap-3">
              <BookOpen size={40} className="text-primary-400" />
              <p className="text-sm text-gray-500">Видео для этого урока не добавлено</p>
            </div>
          ) : (
            <div className="aspect-video w-full bg-gradient-to-br from-indigo-50 to-primary-50 rounded-xl overflow-hidden relative">
              {course.image_url ? (
                <img src={course.image_url} alt={course.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <BookOpen size={56} className="text-primary-300" />
                </div>
              )}
            </div>
          )}

          {/* Lesson info */}
          <div className="mt-5">
            {activeLesson ? (
              <>
                <div className="flex items-start justify-between gap-4">
                  <h1 className="text-xl font-bold text-gray-900">{activeLesson.title}</h1>
                  {course.enrolled && (
                    <button
                      onClick={() => toggleComplete(activeLesson)}
                      disabled={togglingLesson === activeLesson.id}
                      className={`shrink-0 flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-xl transition-all ${
                        completedIds.has(activeLesson.id)
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {togglingLesson === activeLesson.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : completedIds.has(activeLesson.id) ? (
                        <CheckCircle size={14} />
                      ) : (
                        <Circle size={14} />
                      )}
                      {completedIds.has(activeLesson.id) ? 'Пройдено' : 'Отметить'}
                    </button>
                  )}
                </div>
                {activeLesson.description && (
                  <p className="mt-3 text-gray-600 leading-relaxed">{activeLesson.description}</p>
                )}
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{course.title}</h1>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${difficultyColor[course.difficulty]}`}>
                    {difficultyLabel[course.difficulty]}
                  </span>
                  {course.category && <span className="text-xs text-gray-400">{course.category}</span>}
                </div>
                {course.description && (
                  <p className="text-gray-600 leading-relaxed">{course.description}</p>
                )}
              </>
            )}
          </div>

          {/* Enroll / progress */}
          <div className="mt-6 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
            {course.enrolled ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700">Прогресс</span>
                  <span className="text-primary-600 font-bold">{completedCount}/{totalLessons} уроков</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>
                <button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                >
                  Отписаться от курса
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-gray-900">Начать обучение</p>
                  <p className="text-sm text-gray-500">{totalLessons} уроков · бесплатно</p>
                </div>
                <button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="btn-primary shrink-0"
                >
                  {enrolling ? 'Запись...' : 'Записаться'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar: lesson list */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <h2 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wider">Содержание курса</h2>
          {course.sections.length === 0 ? (
            <p className="text-sm text-gray-400 py-4">Уроки ещё не добавлены</p>
          ) : (
            <div className="space-y-4">
              {course.sections.map(section => (
                <div key={section.id}>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-1">
                    {section.title}
                  </p>
                  <div className="space-y-1">
                    {section.lessons.map(lesson => {
                      const isDone = completedIds.has(lesson.id)
                      const isActive = activeLesson?.id === lesson.id
                      const locked = !course.enrolled && !canEdit
                      return (
                        <button
                          key={lesson.id}
                          onClick={() => !locked && setActiveLesson(lesson)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm transition-all ${
                            isActive
                              ? 'bg-primary-50 text-primary-700 font-medium'
                              : locked
                              ? 'text-gray-400 cursor-not-allowed'
                              : 'hover:bg-gray-50 text-gray-700'
                          }`}
                        >
                          <span className="shrink-0">
                            {isDone ? (
                              <CheckCircle size={16} className="text-green-500" />
                            ) : locked ? (
                              <Lock size={14} className="text-gray-300" />
                            ) : lesson.video_url ? (
                              <PlayCircle size={16} className={isActive ? 'text-primary-600' : 'text-gray-400'} />
                            ) : (
                              <Circle size={14} className={isActive ? 'text-primary-400' : 'text-gray-300'} />
                            )}
                          </span>
                          <span className="truncate">{lesson.title}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
