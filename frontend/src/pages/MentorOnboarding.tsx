import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { GraduationCap } from 'lucide-react'
import { useLang } from '../contexts/LangContext'

export default function MentorOnboarding() {
  const navigate = useNavigate()
  const { refresh } = useAuth()
  const { t } = useLang()
  const [fullName, setFullName] = useState('')
  const [university, setUniversity] = useState('')
  const [speciality, setSpeciality] = useState('')
  const [bio, setBio] = useState('')
  const [telegram, setTelegram] = useState('')
  const [phone, setPhone] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleFinish = async () => {
    if (!fullName.trim()) return
    setSaving(true)
    setError('')
    try {
      const { data } = await supabase.auth.getSession()
      const userId = data.session?.user.id
      if (!userId) { navigate('/'); return }
      await api.updateOnboarding(userId, { full_name: fullName })
      await api.saveMentorProfile({
        user_id: userId, full_name: fullName, university, speciality, bio,
        telegram: telegram || undefined,
        phone: phone || undefined,
        contact_email: contactEmail || undefined,
      })
      await refresh()
      navigate('/feed')
    } catch (e: any) {
      setError(e.message || t('mo.saveErr'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="card p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
              <GraduationCap size={20} className="text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{t('mo.title')}</h2>
              <p className="text-sm text-gray-500">{t('mo.sub')}</p>
            </div>
          </div>

          {error && <p className="text-sm text-red-600 mb-4 bg-red-50 px-4 py-2 rounded-xl">{error}</p>}

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('mo.name')}</label>
              <input className="input mt-1" placeholder={t('mo.namePh')} value={fullName} onChange={e => setFullName(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('mo.uni')}</label>
              <input className="input mt-1" placeholder={t('mo.uniPh')} value={university} onChange={e => setUniversity(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('mo.spec')}</label>
              <input className="input mt-1" placeholder={t('mo.specPh')} value={speciality} onChange={e => setSpeciality(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('mo.about')}</label>
              <textarea
                className="input mt-1 resize-none"
                rows={3}
                placeholder={t('mo.aboutPh')}
                value={bio}
                onChange={e => setBio(e.target.value)}
              />
            </div>

            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">{t('mo.contacts')}</p>
              <div className="space-y-3">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">@</span>
                  <input className="input pl-7" placeholder={t('mo.tgPh')} value={telegram} onChange={e => setTelegram(e.target.value.replace('@', ''))} />
                </div>
                <input className="input" type="tel" placeholder={t('mo.phonePh')} value={phone} onChange={e => setPhone(e.target.value)} />
                <input className="input" type="email" placeholder={t('mo.emailPh')} value={contactEmail} onChange={e => setContactEmail(e.target.value)} />
              </div>
            </div>
          </div>

          <button
            className="btn-primary w-full mt-6"
            onClick={handleFinish}
            disabled={saving || !fullName.trim()}
          >
            {saving ? t('mo.saving') : t('mo.done')}
          </button>
        </div>
      </div>
    </div>
  )
}
