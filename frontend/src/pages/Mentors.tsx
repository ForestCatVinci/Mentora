import { useEffect, useState } from 'react'
import { api, Mentor } from '../lib/api'
import MentorCard from '../components/MentorCard'
import { Users } from 'lucide-react'
import { useLang } from '../contexts/LangContext'

function SkeletonCard() {
  return (
    <div className="card p-5 flex flex-col items-center">
      <div className="w-20 h-20 rounded-full skeleton mb-4" />
      <div className="h-4 skeleton rounded-full w-32 mb-2" />
      <div className="h-3 skeleton rounded-full w-24 mb-3" />
      <div className="h-3 skeleton rounded-full w-full mb-1" />
      <div className="h-3 skeleton rounded-full w-3/4 mb-4" />
      <div className="h-9 skeleton rounded-xl w-full" />
    </div>
  )
}

export default function Mentors() {
  const [mentors, setMentors] = useState<Mentor[]>([])
  const [loading, setLoading] = useState(true)
  const { t } = useLang()

  useEffect(() => {
    api.getMentors().then(setMentors).finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
        <Users size={24} className="text-primary-600" />
        {t('mentors.title')}
      </h1>
      <p className="text-gray-500 text-sm mb-6">{t('mentors.sub')}</p>

      {loading && (
        <div className="grid md:grid-cols-3 sm:grid-cols-2 gap-5">
          {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
        </div>
      )}

      {!loading && mentors.length === 0 && (
        <div className="text-center py-20">
          <Users size={48} className="mx-auto text-gray-200 mb-4" />
          <h3 className="font-semibold text-gray-700 mb-2">{t('mentors.soon')}</h3>
          <p className="text-sm text-gray-400">{t('mentors.hiring')}</p>
        </div>
      )}

      {!loading && mentors.length > 0 && (
        <div className="grid md:grid-cols-3 sm:grid-cols-2 gap-5">
          {mentors.map(mentor => <MentorCard key={mentor.id} mentor={mentor} />)}
        </div>
      )}
    </div>
  )
}
