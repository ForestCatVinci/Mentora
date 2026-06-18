import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Compass, Users, ArrowRight, Sparkles } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { api } from '../lib/api'
import { useLang } from '../contexts/LangContext'
import LangSwitcher from '../components/LangSwitcher'

export default function Landing() {
  const navigate = useNavigate()
  const { t } = useLang()
  const [mode, setMode] = useState<'idle' | 'signin' | 'signup'>('idle')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [mentorCode, setMentorCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    navigate('/feed')
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const result = await api.register({ email, password, full_name: fullName, mentor_code: mentorCode || undefined })
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      navigate(result.role === 'mentor' ? '/mentor-onboarding' : '/onboarding')
    } catch (err: any) {
      setError(err.message || 'Registration failed')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-indigo-50">
      {/* Language switcher */}
      <div className="absolute top-4 right-6 z-10">
        <LangSwitcher />
      </div>

      {/* Hero */}
      <div className="max-w-6xl mx-auto px-6 pt-16 pb-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
              <Sparkles size={14} />
              {t('landing.badge')}
            </div>
            <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-5">
              {t('landing.hero')}
            </h1>
            <p className="text-lg text-gray-500 leading-relaxed mb-8">
              {t('landing.sub')}
            </p>
            <div className="flex gap-3 flex-wrap">
              <button onClick={() => setMode('signup')} className="btn-primary flex items-center gap-2 text-base px-6 py-3">
                {t('landing.start')} <ArrowRight size={18} />
              </button>
              <button onClick={() => setMode('signin')} className="btn-secondary text-base px-6 py-3">
                {t('landing.signin')}
              </button>
            </div>
          </div>

          {/* Auth form */}
          <div className="card p-8">
            {mode === 'idle' && (
              <div className="text-center">
                <div className="text-6xl mb-4">🎓</div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">{t('landing.welcome')}</h2>
                <p className="text-gray-500 text-sm mb-6">{t('landing.welcomeSub')}</p>
                <button onClick={() => setMode('signup')} className="btn-primary w-full mb-3">
                  {t('landing.register')}
                </button>
                <button onClick={() => setMode('signin')} className="btn-secondary w-full">
                  {t('landing.hasAccount')}
                </button>
              </div>
            )}

            {mode === 'signin' && (
              <form onSubmit={handleSignIn}>
                <h2 className="text-xl font-bold mb-6">{t('landing.signinTitle')}</h2>
                {error && <p className="text-sm text-red-600 mb-4 bg-red-50 px-4 py-2 rounded-xl">{error}</p>}
                <div className="space-y-3 mb-5">
                  <input className="input" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
                  <input className="input" type="password" placeholder={t('landing.password')} value={password} onChange={e => setPassword(e.target.value)} required />
                </div>
                <button type="submit" className="btn-primary w-full mb-3" disabled={loading}>
                  {loading ? t('landing.signingIn') : t('landing.signin')}
                </button>
                <button type="button" onClick={() => setMode('signup')} className="text-sm text-primary-600 hover:underline">
                  {t('landing.noAccount')}
                </button>
              </form>
            )}

            {mode === 'signup' && (
              <form onSubmit={handleSignUp}>
                <h2 className="text-xl font-bold mb-6">{t('landing.signupTitle')}</h2>
                {error && <p className="text-sm text-red-600 mb-4 bg-red-50 px-4 py-2 rounded-xl">{error}</p>}
                <div className="space-y-3 mb-5">
                  <input className="input" type="text" placeholder={t('landing.fullName')} value={fullName} onChange={e => setFullName(e.target.value)} required />
                  <input className="input" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
                  <input className="input" type="password" placeholder={t('landing.passwordMin')} value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
                  <input className="input" type="text" placeholder={t('landing.mentorCode')} value={mentorCode} onChange={e => setMentorCode(e.target.value)} />
                </div>
                <button type="submit" className="btn-primary w-full mb-3" disabled={loading}>
                  {loading ? t('landing.creating') : t('landing.register')}
                </button>
                <button type="button" onClick={() => setMode('signin')} className="text-sm text-primary-600 hover:underline">
                  {t('landing.haveAccount')}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mt-20">
          {[
            { icon: Compass,  titleKey: 'landing.feat1Title' as const, descKey: 'landing.feat1Desc' as const },
            { icon: BookOpen, titleKey: 'landing.feat2Title' as const, descKey: 'landing.feat2Desc' as const },
            { icon: Users,    titleKey: 'landing.feat3Title' as const, descKey: 'landing.feat3Desc' as const },
          ].map(({ icon: Icon, titleKey, descKey }) => (
            <div key={titleKey} className="card p-6">
              <div className="w-11 h-11 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
                <Icon size={22} className="text-primary-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{t(titleKey)}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{t(descKey)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
