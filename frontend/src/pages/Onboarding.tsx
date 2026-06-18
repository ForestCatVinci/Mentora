import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

const INTERESTS = ['STEM', 'Business', 'CS', 'Math', 'Language', 'Research', 'Olympiads', 'Entrepreneurship', 'Science', 'Social Impact']

const GOALS = [
  { value: 'university_abroad', label: 'Поступление за рубеж', emoji: '🌍' },
  { value: 'olympiads',         label: 'Олимпиады',            emoji: '🏆' },
  { value: 'startup',           label: 'Стартап',              emoji: '🚀' },
  { value: 'research',          label: 'Исследования',         emoji: '🔬' },
]

export default function Onboarding() {
  const navigate = useNavigate()
  const { refresh } = useAuth()
  const [step, setStep] = useState(1)
  const [grade, setGrade] = useState<number | null>(null)
  const [interests, setInterests] = useState<string[]>([])
  const [goals, setGoals] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  const toggleInterest = (v: string) =>
    setInterests(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v])

  const toggleGoal = (v: string) =>
    setGoals(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v])

  const handleFinish = async () => {
    if (!grade || interests.length === 0 || goals.length === 0) return
    setSaving(true)
    const { data } = await supabase.auth.getSession()
    const userId = data.session?.user.id
    if (!userId) { navigate('/'); return }
    await api.updateOnboarding(userId, { grade, interests, goals })
    await refresh()
    navigate('/feed')
  }

  const progress = ((step - 1) / 3) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-gray-400 mb-2">
            <span>Шаг {step} из 3</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-600 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="card p-8 animate-fade-in">
          {/* Step 1: Grade */}
          {step === 1 && (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">В каком ты классе?</h2>
              <p className="text-gray-500 mb-6">Мы подберём возможности под твой класс</p>
              <div className="grid grid-cols-2 gap-4">
                {[8, 9, 10, 11].map(g => (
                  <button
                    key={g}
                    onClick={() => setGrade(g)}
                    className={`
                      aspect-square rounded-2xl text-4xl font-bold border-2 transition-all duration-150
                      ${grade === g
                        ? 'border-primary-600 bg-primary-50 text-primary-700 scale-105'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-primary-300 hover:bg-primary-50'
                      }
                    `}
                  >
                    {g}
                  </button>
                ))}
              </div>
              <button
                className="btn-primary w-full mt-6"
                disabled={!grade}
                onClick={() => setStep(2)}
              >
                Далее
              </button>
            </>
          )}

          {/* Step 2: Interests */}
          {step === 2 && (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Что тебя интересует?</h2>
              <p className="text-gray-500 mb-6">Выбери несколько направлений</p>
              <div className="flex flex-wrap gap-2 mb-6">
                {INTERESTS.map(interest => (
                  <button
                    key={interest}
                    onClick={() => toggleInterest(interest)}
                    className={`
                      px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all duration-150
                      ${interests.includes(interest)
                        ? 'border-primary-600 bg-primary-600 text-white'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-primary-300'
                      }
                    `}
                  >
                    {interest}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button className="btn-secondary flex-1" onClick={() => setStep(1)}>Назад</button>
                <button className="btn-primary flex-1" disabled={interests.length === 0} onClick={() => setStep(3)}>Далее</button>
              </div>
            </>
          )}

          {/* Step 3: Goals */}
          {step === 3 && (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Какая у тебя цель?</h2>
              <p className="text-gray-500 mb-6">Можешь выбрать несколько</p>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {GOALS.map(({ value, label, emoji }) => (
                  <button
                    key={value}
                    onClick={() => toggleGoal(value)}
                    className={`
                      p-4 rounded-2xl border-2 text-left transition-all duration-150
                      ${goals.includes(value)
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200 bg-white hover:border-primary-300'
                      }
                    `}
                  >
                    <div className="text-2xl mb-2">{emoji}</div>
                    <div className={`text-sm font-semibold ${goals.includes(value) ? 'text-primary-700' : 'text-gray-700'}`}>
                      {label}
                    </div>
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button className="btn-secondary flex-1" onClick={() => setStep(2)}>Назад</button>
                <button
                  className="btn-primary flex-1"
                  disabled={goals.length === 0 || saving}
                  onClick={handleFinish}
                >
                  {saving ? 'Сохраняем...' : 'Готово 🎉'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
