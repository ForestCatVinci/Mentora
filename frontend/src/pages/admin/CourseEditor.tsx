import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api, Course, Section, Lesson, UserProfile } from '../../lib/api'
import {
  BookOpen, Plus, Trash2, ChevronLeft, Eye, EyeOff,
  Check, X, Loader2, GripVertical, Video, FileText
} from 'lucide-react'

interface Props {
  user: UserProfile
}

function EditableText({
  value,
  onSave,
  className = '',
  placeholder = '',
  multiline = false,
}: {
  value: string
  onSave: (v: string) => void
  className?: string
  placeholder?: string
  multiline?: boolean
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const ref = useRef<HTMLInputElement & HTMLTextAreaElement>(null)

  useEffect(() => { if (editing) ref.current?.focus() }, [editing])

  const commit = () => {
    if (draft.trim()) onSave(draft.trim())
    else setDraft(value)
    setEditing(false)
  }

  if (editing) {
    const props = {
      ref,
      value: draft,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setDraft(e.target.value),
      onBlur: commit,
      onKeyDown: (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !multiline) { e.preventDefault(); commit() }
        if (e.key === 'Escape') { setDraft(value); setEditing(false) }
      },
      className: `w-full border border-primary-300 rounded-lg px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-primary-200 ${className}`,
      placeholder,
    }
    return multiline
      ? <textarea {...props} rows={3} className={`${props.className} resize-none`} />
      : <input {...props} />
  }

  return (
    <span
      onClick={() => setEditing(true)}
      className={`cursor-text hover:bg-gray-100 rounded px-1 py-0.5 transition-colors ${className}`}
    >
      {value || <span className="text-gray-400 italic">{placeholder}</span>}
    </span>
  )
}

function LessonRow({
  lesson,
  courseId,
  onUpdate,
  onDelete,
}: {
  lesson: Lesson
  courseId: string
  onUpdate: (l: Lesson) => void
  onDelete: (id: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const save = async (patch: Partial<Lesson>) => {
    const updated = await api.updateLesson(lesson.id, patch)
    onUpdate(updated)
  }

  const handleDelete = async () => {
    setDeleting(true)
    await api.deleteLesson(lesson.id)
    onDelete(lesson.id)
  }

  return (
    <div className="bg-white border border-gray-100 rounded-xl">
      <div className="flex items-center gap-2 px-3 py-2.5">
        <GripVertical size={14} className="text-gray-300 shrink-0" />
        {lesson.video_url ? (
          <Video size={14} className="text-primary-400 shrink-0" />
        ) : (
          <FileText size={14} className="text-gray-300 shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <EditableText
            value={lesson.title}
            onSave={title => save({ title })}
            placeholder="Название урока"
            className="font-medium text-sm text-gray-800"
          />
        </div>
        <button
          onClick={() => setExpanded(e => !e)}
          className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded hover:bg-gray-50 shrink-0"
        >
          {expanded ? 'Скрыть' : 'Детали'}
        </button>
        {confirmDelete ? (
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={handleDelete} disabled={deleting}
              className="p-1 text-red-600 hover:bg-red-50 rounded">
              {deleting ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
            </button>
            <button onClick={() => setConfirmDelete(false)}
              className="p-1 text-gray-400 hover:bg-gray-50 rounded">
              <X size={13} />
            </button>
          </div>
        ) : (
          <button onClick={() => setConfirmDelete(true)}
            className="p-1 text-gray-300 hover:text-red-500 rounded hover:bg-red-50 shrink-0 transition-colors">
            <Trash2 size={13} />
          </button>
        )}
      </div>

      {expanded && (
        <div className="px-3 pb-3 border-t border-gray-50 pt-3 space-y-2">
          <div>
            <p className="text-xs text-gray-400 mb-1">URL видео (YouTube или прямая ссылка)</p>
            <EditableText
              value={lesson.video_url ?? ''}
              onSave={video_url => save({ video_url })}
              placeholder="https://youtube.com/watch?v=..."
              className="text-sm text-gray-600 block w-full"
            />
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Описание урока</p>
            <EditableText
              value={lesson.description ?? ''}
              onSave={description => save({ description })}
              placeholder="Что изучим в этом уроке..."
              className="text-sm text-gray-600 block w-full"
              multiline
            />
          </div>
        </div>
      )}
    </div>
  )
}

function SectionBlock({
  section,
  courseId,
  onUpdate,
  onDelete,
  onAddLesson,
}: {
  section: Section
  courseId: string
  onUpdate: (s: Section) => void
  onDelete: (id: string) => void
  onAddLesson: (sectionId: string) => Promise<void>
}) {
  const [addingLesson, setAddingLesson] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const updateLesson = (updated: Lesson) => {
    onUpdate({ ...section, lessons: section.lessons.map(l => l.id === updated.id ? updated : l) })
  }

  const deleteLesson = (id: string) => {
    onUpdate({ ...section, lessons: section.lessons.filter(l => l.id !== id) })
  }

  const handleAddLesson = async () => {
    setAddingLesson(true)
    await onAddLesson(section.id)
    setAddingLesson(false)
  }

  const handleDeleteSection = async () => {
    setDeleting(true)
    await api.deleteSection(courseId, section.id)
    onDelete(section.id)
  }

  return (
    <div className="bg-gray-50 rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <EditableText
          value={section.title}
          onSave={title => api.updateSection(courseId, section.id, { title }).then(s => onUpdate({ ...section, title: s.title }))}
          className="font-bold text-gray-800 text-sm flex-1"
          placeholder="Название раздела"
        />
        {confirmDelete ? (
          <div className="flex items-center gap-1">
            <button onClick={handleDeleteSection} disabled={deleting}
              className="p-1 text-red-600 hover:bg-red-100 rounded">
              {deleting ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            </button>
            <button onClick={() => setConfirmDelete(false)}
              className="p-1 text-gray-400 hover:bg-gray-100 rounded">
              <X size={14} />
            </button>
          </div>
        ) : (
          <button onClick={() => setConfirmDelete(true)}
            className="p-1 text-gray-300 hover:text-red-500 rounded transition-colors">
            <Trash2 size={15} />
          </button>
        )}
      </div>

      <div className="space-y-2 mb-3">
        {section.lessons.map(lesson => (
          <LessonRow
            key={lesson.id}
            lesson={lesson}
            courseId={courseId}
            onUpdate={updateLesson}
            onDelete={deleteLesson}
          />
        ))}
      </div>

      <button
        onClick={handleAddLesson}
        disabled={addingLesson}
        className="flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-800 font-medium px-2 py-1.5 rounded-lg hover:bg-primary-50 transition-colors w-full"
      >
        {addingLesson ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
        Добавить урок
      </button>
    </div>
  )
}

export default function CourseEditor({ user }: Props) {
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [addingSection, setAddingSection] = useState(false)
  const [togglingPublish, setTogglingPublish] = useState(false)
  const [newSectionTitle, setNewSectionTitle] = useState('')
  const [showSectionInput, setShowSectionInput] = useState(false)

  useEffect(() => {
    if (!courseId) return
    api.getCourse(courseId, user.id)
      .then(c => setCourse(c))
      .catch(e => setLoadError(e.message ?? 'Ошибка загрузки курса'))
      .finally(() => setLoading(false))
  }, [courseId, user.id])

  const totalLessons = course?.sections.reduce((n, s) => n + s.lessons.length, 0) ?? 0

  const handleTogglePublish = async () => {
    if (!course) return
    setTogglingPublish(true)
    const updated = await api.updateCourse(course.id, { is_published: !course.is_published })
    setCourse(c => c ? { ...c, is_published: updated.is_published } : c)
    setTogglingPublish(false)
  }

  const handleAddSection = async () => {
    if (!course || !newSectionTitle.trim()) return
    setAddingSection(true)
    const section = await api.createSection(course.id, newSectionTitle.trim())
    setCourse(c => c ? { ...c, sections: [...c.sections, section] } : c)
    setNewSectionTitle('')
    setShowSectionInput(false)
    setAddingSection(false)
  }

  const handleAddLesson = async (sectionId: string) => {
    if (!course) return
    const lesson = await api.createLesson(course.id, sectionId, { title: 'Новый урок' })
    setCourse(c => c ? {
      ...c,
      sections: c.sections.map(s => s.id === sectionId ? { ...s, lessons: [...s.lessons, lesson] } : s)
    } : c)
  }

  const updateSection = (updated: Section) => {
    setCourse(c => c ? { ...c, sections: c.sections.map(s => s.id === updated.id ? updated : s) } : c)
  }

  const deleteSection = (id: string) => {
    setCourse(c => c ? { ...c, sections: c.sections.filter(s => s.id !== id) } : c)
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
        <h2 className="text-xl font-bold text-gray-700 mb-2">Курс не найден</h2>
        {loadError && <p className="text-sm text-red-500 mb-4 bg-red-50 px-4 py-2 rounded-xl inline-block">{loadError}</p>}
        <br />
        <button className="btn-secondary mt-4" onClick={() => navigate('/courses')}>Назад</button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(`/courses/${course.id}`)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors">
          <ChevronLeft size={16} />
          Назад
        </button>
        <div className="flex-1" />
        <button
          onClick={() => navigate(`/courses/${course.id}`)}
          className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors"
        >
          <Eye size={14} />
          Предпросмотр
        </button>
        <button
          onClick={handleTogglePublish}
          disabled={togglingPublish}
          className={`flex items-center gap-1.5 text-sm font-semibold px-4 py-1.5 rounded-xl transition-all ${
            course.is_published
              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              : 'bg-primary-600 text-white hover:bg-primary-700'
          }`}
        >
          {togglingPublish ? <Loader2 size={14} className="animate-spin" /> : course.is_published ? <EyeOff size={14} /> : <Eye size={14} />}
          {course.is_published ? 'Снять с публикации' : 'Опубликовать'}
        </button>
      </div>

      {/* Course meta */}
      <div className="card p-5 mb-6">
        <div className="flex items-start gap-4">
          {course.image_url ? (
            <img src={course.image_url} alt={course.title} className="w-24 h-16 object-cover rounded-xl shrink-0" />
          ) : (
            <div className="w-24 h-16 bg-gradient-to-br from-indigo-100 to-primary-200 rounded-xl flex items-center justify-center shrink-0">
              <BookOpen size={24} className="text-primary-400" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-gray-900 mb-1">{course.title}</h1>
            <p className="text-sm text-gray-500">
              {course.sections.length} {course.sections.length === 1 ? 'раздел' : 'разделов'} · {totalLessons} уроков
              {course.is_published && (
                <span className="ml-2 text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">
                  Опубликован
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-4 mb-5">
        {course.sections.map(section => (
          <SectionBlock
            key={section.id}
            section={section}
            courseId={course.id}
            onUpdate={updateSection}
            onDelete={deleteSection}
            onAddLesson={handleAddLesson}
          />
        ))}
      </div>

      {/* Add section */}
      {showSectionInput ? (
        <div className="flex gap-2">
          <input
            className="input flex-1"
            placeholder="Название раздела"
            value={newSectionTitle}
            onChange={e => setNewSectionTitle(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleAddSection(); if (e.key === 'Escape') setShowSectionInput(false) }}
            autoFocus
          />
          <button onClick={handleAddSection} disabled={addingSection || !newSectionTitle.trim()} className="btn-primary px-4">
            {addingSection ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
          </button>
          <button onClick={() => setShowSectionInput(false)} className="btn-secondary px-4">
            <X size={16} />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowSectionInput(true)}
          className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-200 hover:border-primary-300 rounded-2xl text-sm font-medium text-gray-400 hover:text-primary-600 transition-all"
        >
          <Plus size={16} />
          Добавить раздел
        </button>
      )}
    </div>
  )
}
