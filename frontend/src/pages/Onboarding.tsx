import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useLang } from '../contexts/LangContext'
import type { TKey } from '../lib/i18n'

const INTERESTS = ['STEM', 'Business', 'CS', 'Math', 'Language', 'Research', 'Olympiads', 'Entrepreneurship', 'Science', 'Social Impact']

const GOAL_ITEMS: { value: string; key: TKey; emoji: string }[] = [
  { value: 'university_abroad', key: 'onb.goal.university_abroad', emoji: '🌍' },
  { value: 'olympiads',         key: 'onb.goal.olympiads',         emoji: '🏆' },
  { value: 'startup',           key: 'onb.goal.startup',           emoji: '🚀' },
  { value: 'research',          key: 'onb.goal.research',          emoji: '🔬' },
]

export default function Onboarding() {
  const navigate = useNavigate()
  const { refresh } = useAuth()
  const { t } = useLang()
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
        <div className="mb-8">
          <div className="flex justify-between text-xs text-gray-400 mb-2">
            <span>{t('onb.step', { n: String(step) })}</span>
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
          {step === 1 && (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('onb.gradeQ')}</h2>
              <p className="text-gray-500 mb-6">{t('onb.gradeHint')}</p>
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
                {t('onb.next')}
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('onb.intQ')}</h2>
              <p className="text-gray-500 mb-6">{t('onb.intHint')}</p>
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
                <button className="btn-secondary flex-1" onClick={() => setStep(1)}>{t('onb.back')}</button>
                <button className="btn-primary flex-1" disabled={interests.length === 0} onClick={() => setStep(3)}>{t('onb.next')}</button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('onb.goalQ')}</h2>
              <p className="text-gray-500 mb-6">{t('onb.goalHint')}</p>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {GOAL_ITEMS.map(({ value, key, emoji }) => (
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
                      {t(key)}
                    </div>
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button className="btn-secondary flex-1" onClick={() => setStep(2)}>{t('onb.back')}</button>
                <button
                  className="btn-primary flex-1"
                  disabled={goals.length === 0 || saving}
                  onClick={handleFinish}
                >
                  {saving ? t('onb.saving') : t('onb.done')}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
