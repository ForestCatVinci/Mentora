interface Props {
  tag: string
  variant?: 'default' | 'category'
}

const categoryColors: Record<string, string> = {
  competition:    'bg-blue-100 text-blue-700',
  event:          'bg-green-100 text-green-700',
  scholarship:    'bg-yellow-100 text-yellow-700',
  summer_program: 'bg-orange-100 text-orange-700',
  internship:     'bg-cyan-100 text-cyan-700',
  research:       'bg-purple-100 text-purple-700',
  hackathon:      'bg-pink-100 text-pink-700',
  olympiad:       'bg-red-100 text-red-700',
  course:         'bg-indigo-100 text-indigo-700',
  other:          'bg-gray-100 text-gray-600',
}

const categoryLabels: Record<string, string> = {
  competition:    'Конкурс',
  event:          'Мероприятие',
  scholarship:    'Стипендия',
  summer_program: 'Летняя программа',
  internship:     'Стажировка',
  research:       'Исследование',
  hackathon:      'Хакатон',
  olympiad:       'Олимпиада',
  course:         'Курс',
  other:          'Другое',
}

export default function TagBadge({ tag, variant = 'default' }: Props) {
  if (variant === 'category') {
    const color = categoryColors[tag] ?? categoryColors.other
    const label = categoryLabels[tag] ?? tag
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${color}`}>
        {label}
      </span>
    )
  }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-50 text-primary-700">
      #{tag}
    </span>
  )
}
