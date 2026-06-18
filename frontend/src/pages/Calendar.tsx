import { useEffect, useState, useMemo } from 'react'
import { api, Post, UserProfile } from '../lib/api'
import { ChevronLeft, ChevronRight, CalendarDays, Clock, ExternalLink } from 'lucide-react'
import { useLang } from '../contexts/LangContext'
import type { TKey } from '../lib/i18n'

interface Props {
  user: UserProfile
}

function toLocalDate(str: string) {
  const [y, m, d] = str.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function dateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

function buildEventMap(posts: Post[]): Map<string, Post[]> {
  const map = new Map<string, Post[]>()
  const add = (key: string, post: Post) => {
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(post)
  }
  for (const post of posts) {
    if (!post.deadline_date) continue
    if (post.end_date) {
      const start = toLocalDate(post.deadline_date)
      const end = toLocalDate(post.end_date)
      const cur = new Date(start)
      while (cur <= end) {
        add(dateKey(cur), post)
        cur.setDate(cur.getDate() + 1)
      }
    } else {
      add(post.deadline_date, post)
    }
  }
  return map
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function firstWeekdayOfMonth(year: number, month: number) {
  return (new Date(year, month, 1).getDay() + 6) % 7
}

function isPeriod(post: Post) {
  return !!post.deadline_date && !!post.end_date
}

export default function CalendarPage({ user }: Props) {
  const today = new Date()
  const { t } = useLang()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selectedDay, setSelectedDay] = useState<string | null>(dateKey(today))
  const [savedPosts, setSavedPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  const MONTHS = Array.from({ length: 12 }, (_, i) => t(`month.${i}` as TKey))
  const DAYS = Array.from({ length: 7 }, (_, i) => t(`day.${i}` as TKey))
  const locale = t('cal.locale')

  const formatDate = (dateStr: string) => {
    const d = toLocalDate(dateStr)
    return d.toLocaleDateString(locale, { day: 'numeric', month: 'long' })
  }

  useEffect(() => {
    api.getFeed(user.id)
      .then(posts => setSavedPosts(posts.filter(p => p.is_saved && p.deadline_date)))
      .finally(() => setLoading(false))
  }, [user.id])

  const eventMap = useMemo(() => buildEventMap(savedPosts), [savedPosts])

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  const totalDays = daysInMonth(year, month)
  const offset = firstWeekdayOfMonth(year, month)
  const totalCells = Math.ceil((offset + totalDays) / 7) * 7

  const selectedEvents = selectedDay ? (eventMap.get(selectedDay) ?? []) : []
  const uniqueEvents = selectedEvents.filter((p, i, arr) => arr.findIndex(x => x.id === p.id) === i)

  const todayKey = dateKey(today)

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <CalendarDays size={24} className="text-primary-600" />
        {t('cal.title')}
      </h1>

      <div className="card p-5 mb-5">
        {/* Month nav */}
        <div className="flex items-center justify-between mb-5">
          <button onClick={prevMonth}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors">
            <ChevronLeft size={18} />
          </button>
          <span className="font-bold text-gray-900 text-base">
            {MONTHS[month]} {year}
          </span>
          <button onClick={nextMonth}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors">
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {DAYS.map((d, i) => (
            <div key={i} className={`text-center text-xs font-semibold py-1 ${i >= 5 ? 'text-red-400' : 'text-gray-400'}`}>
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-y-1">
          {Array.from({ length: totalCells }).map((_, i) => {
            const day = i - offset + 1
            const isValid = day >= 1 && day <= totalDays
            if (!isValid) return <div key={i} />

            const key = `${year}-${String(month + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
            const events = eventMap.get(key) ?? []
            const hasEvent = events.length > 0
            const isToday = key === todayKey
            const isSelected = key === selectedDay
            const isWeekend = (i % 7) >= 5

            const deadlineCount = events.filter(e => !isPeriod(e)).length
            const periodCount = events.filter(e => isPeriod(e)).length

            return (
              <button
                key={key}
                onClick={() => setSelectedDay(key)}
                className={`relative flex flex-col items-center py-1.5 rounded-xl transition-all duration-150 ${
                  isSelected
                    ? 'bg-primary-600 text-white'
                    : isToday
                    ? 'bg-primary-50 text-primary-700 font-bold ring-2 ring-primary-300'
                    : isWeekend
                    ? 'text-red-500 hover:bg-gray-50'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="text-sm font-medium leading-none mb-1">{day}</span>
                {hasEvent && (
                  <div className="flex gap-0.5 justify-center h-2">
                    {deadlineCount > 0 && (
                      <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-red-200' : 'bg-red-500'}`} />
                    )}
                    {periodCount > 0 && (
                      <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-blue-200' : 'bg-blue-500'}`} />
                    )}
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-50">
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
            {t('cal.deadline')}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
            {t('cal.event')}
          </div>
        </div>
      </div>

      {/* Selected day events */}
      {selectedDay && (
        <div>
          <h2 className="font-bold text-gray-800 mb-3 text-sm">
            {formatDate(selectedDay)}
            {uniqueEvents.length > 0 && (
              <span className="ml-2 text-xs font-normal text-gray-400">
                {uniqueEvents.length} {uniqueEvents.length === 1 ? t('cal.event1') : t('cal.eventsN')}
              </span>
            )}
          </h2>

          {loading && (
            <div className="text-center py-8 text-gray-400 text-sm">{t('cal.loading')}</div>
          )}

          {!loading && uniqueEvents.length === 0 && (
            <div className="text-center py-8">
              <CalendarDays size={36} className="mx-auto text-gray-200 mb-2" />
              <p className="text-sm text-gray-400">{t('cal.noEvents')}</p>
              <p className="text-xs text-gray-300 mt-1">{t('cal.saveHint')}</p>
            </div>
          )}

          <div className="space-y-3">
            {uniqueEvents.map(post => {
              const period = isPeriod(post)
              return (
                <div key={post.id} className={`rounded-xl p-3 border ${period ? 'bg-blue-50 border-blue-100' : 'bg-red-50 border-red-100'}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900 leading-tight mb-1">{post.title}</p>
                      <div className={`flex items-center gap-1 text-xs font-medium ${period ? 'text-blue-600' : 'text-red-600'}`}>
                        <Clock size={11} />
                        {period
                          ? `${formatDate(post.deadline_date!)} — ${formatDate(post.end_date!)}`
                          : `${t('cal.deadlineLbl')} ${formatDate(post.deadline_date!)}`
                        }
                      </div>
                      {post.description && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{post.description}</p>
                      )}
                    </div>
                    {post.link && (
                      <a href={post.link} target="_blank" rel="noopener noreferrer"
                        className={`shrink-0 p-1.5 rounded-lg transition-colors ${period ? 'text-blue-500 hover:bg-blue-100' : 'text-red-500 hover:bg-red-100'}`}>
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
