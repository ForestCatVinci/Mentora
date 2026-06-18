import { useEffect, useState } from 'react'
import { Map } from 'lucide-react'
import { UserProfile } from '../lib/api'

interface Props {
  user: UserProfile
}

const ROADMAP: Record<number, { label: string; items: string[] }[]> = {
  8: [
    { label: 'Олимпиады', items: ['Зарегистрируйся на школьную олимпиаду по математике', 'Участвуй в олимпиаде по информатике', 'Пройди олимпиаду "Кенгуру"'] },
    { label: 'Навыки', items: ['Начни учить Python', 'Прочитай 12 книг за год', 'Освой базовый английский (A2)'] },
  ],
  9: [
    { label: 'Конкурсы', items: ['Участвуй в городских олимпиадах', 'Подай заявку на летнюю школу', 'Попробуй себя на хакатоне'] },
    { label: 'Подготовка', items: ['Начни готовиться к SAT/IELTS', 'Создай аккаунт на Coursera', 'Найди ментора в своей области'] },
  ],
  10: [
    { label: 'Достижения', items: ['Участвуй в республиканских олимпиадах', 'Пройди международную летнюю школу', 'Создай проект для портфолио'] },
    { label: 'Поступление', items: ['Сдай IELTS (цель: 7.0+)', 'Изучи требования вузов мечты', 'Начни писать эссе Common App'] },
  ],
  11: [
    { label: 'Финальный рывок', items: ['Подай документы в зарубежные вузы', 'Подай на стипендии (Болашак, Chevening)', 'Участвуй в международных олимпиадах'] },
    { label: 'Итоги', items: ['Собери рекомендательные письма', 'Финализируй портфолио', 'Подготовься к интервью'] },
  ],
}

const STORAGE_KEY = 'mentoria_roadmap_checks'

export default function Roadmap({ user }: Props) {
  const [checked, setChecked] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')) }
    catch { return new Set() }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...checked]))
  }, [checked])

  const toggle = (key: string) =>
    setChecked(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
        <Map size={24} className="text-primary-600" />
        Roadmap школьника
      </h1>
      <p className="text-gray-500 text-sm mb-8">Ориентир по важным активностям для каждого класса</p>

      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200" />
        <div className="space-y-10">
          {[8, 9, 10, 11].map(grade => {
            const isCurrent = user.grade === grade
            const isPast = user.grade !== null && grade < user.grade
            const sections = ROADMAP[grade] ?? []

            return (
              <div key={grade} className="relative pl-14">
                {/* Dot */}
                <div className={`
                  absolute left-0 top-1 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 bg-white
                  ${isCurrent ? 'border-primary-600 text-primary-700 shadow-md shadow-primary-100' : ''}
                  ${isPast ? 'border-gray-300 text-gray-400' : ''}
                  ${!isCurrent && !isPast ? 'border-gray-200 text-gray-400' : ''}
                `}>
                  {grade}
                </div>

                <div className={`card p-5 ${isCurrent ? 'ring-2 ring-primary-300' : ''}`}>
                  <div className="flex items-center gap-2 mb-4">
                    <h2 className={`font-bold text-lg ${isCurrent ? 'text-primary-700' : 'text-gray-700'}`}>
                      {grade} класс
                    </h2>
                    {isCurrent && (
                      <span className="text-xs bg-primary-100 text-primary-700 font-semibold px-2.5 py-0.5 rounded-full">
                        Сейчас
                      </span>
                    )}
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    {sections.map(({ label, items }) => (
                      <div key={label}>
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{label}</h3>
                        <ul className="space-y-2">
                          {items.map(item => {
                            const key = `${grade}-${item}`
                            return (
                              <li key={item} className="flex items-start gap-2.5">
                                <button
                                  onClick={() => toggle(key)}
                                  className={`
                                    mt-0.5 w-4 h-4 rounded border-2 shrink-0 flex items-center justify-center transition-all duration-150
                                    ${checked.has(key)
                                      ? 'bg-primary-600 border-primary-600'
                                      : 'border-gray-300 hover:border-primary-400'
                                    }
                                  `}
                                >
                                  {checked.has(key) && (
                                    <svg viewBox="0 0 10 8" className="w-2.5 h-2.5" fill="none">
                                      <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                  )}
                                </button>
                                <span className={`text-sm leading-snug ${checked.has(key) ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                                  {item}
                                </span>
                              </li>
                            )
                          })}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
