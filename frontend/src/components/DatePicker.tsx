import { useState, useRef, useEffect } from 'react'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  value: string
  onChange: (date: string) => void
  placeholder?: string
}

const MONTHS = ['Январь','Февраль','Март','Апрель','Май','Июнь',
                 'Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь']
const DAYS_SHORT = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс']

export default function DatePicker({ value, onChange, placeholder = 'Выберите дату' }: Props) {
  const today = new Date()
  const [open, setOpen] = useState(false)
  const [view, setView] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const prevMonth = () => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))
  const nextMonth = () => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))

  const firstDay = new Date(view.getFullYear(), view.getMonth(), 1)
  // Monday-based offset
  const startOffset = (firstDay.getDay() + 6) % 7
  const daysInMonth = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate()

  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  const selectDate = (day: number) => {
    const d = new Date(view.getFullYear(), view.getMonth(), day)
    onChange(d.toISOString().split('T')[0])
    setOpen(false)
  }

  const displayValue = value
    ? new Date(value).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
    : ''

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="input flex items-center gap-2 text-left"
      >
        <Calendar size={16} className="text-gray-400 shrink-0" />
        <span className={value ? 'text-gray-900' : 'text-gray-400'}>{displayValue || placeholder}</span>
      </button>

      {open && (
        <div className="absolute z-50 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 w-72 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <button type="button" onClick={prevMonth} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
              <ChevronLeft size={16} />
            </button>
            <span className="font-semibold text-sm">
              {MONTHS[view.getMonth()]} {view.getFullYear()}
            </span>
            <button type="button" onClick={nextMonth} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS_SHORT.map((d) => (
              <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, i) => {
              if (!day) return <div key={`e-${i}`} />
              const thisDate = new Date(view.getFullYear(), view.getMonth(), day)
              const isToday = thisDate.toDateString() === today.toDateString()
              const isSelected = value === thisDate.toISOString().split('T')[0]
              const isPast = thisDate < new Date(today.getFullYear(), today.getMonth(), today.getDate())

              return (
                <button
                  key={day}
                  type="button"
                  disabled={isPast}
                  onClick={() => selectDate(day)}
                  className={`
                    aspect-square text-sm rounded-lg font-medium transition-all duration-100
                    ${isSelected ? 'bg-primary-600 text-white' : ''}
                    ${isToday && !isSelected ? 'ring-2 ring-primary-300' : ''}
                    ${!isSelected && !isPast ? 'hover:bg-primary-50 text-gray-700' : ''}
                    ${isPast ? 'text-gray-300 cursor-not-allowed' : ''}
                  `}
                >
                  {day}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
