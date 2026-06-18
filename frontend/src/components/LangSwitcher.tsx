import { useLang } from '../contexts/LangContext'
import type { Lang } from '../lib/i18n'

const LANGS: { value: Lang; label: string }[] = [
  { value: 'ru', label: 'РУС' },
  { value: 'en', label: 'ENG' },
  { value: 'kz', label: 'ҚАЗ' },
]

interface Props {
  compact?: boolean
}

export default function LangSwitcher({ compact }: Props) {
  const { lang, setLang } = useLang()
  return (
    <div className={`flex ${compact ? 'gap-0.5' : 'gap-1'}`}>
      {LANGS.map(l => (
        <button
          key={l.value}
          onClick={() => setLang(l.value)}
          className={`${compact ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-1 text-xs'} rounded-lg font-semibold transition-all duration-150 ${
            lang === l.value
              ? 'bg-primary-600 text-white'
              : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  )
}
