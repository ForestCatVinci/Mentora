import { useEffect, useState } from 'react'
import { api, Post, UserProfile } from '../lib/api'
import PostCard from '../components/PostCard'
import { LayoutDashboard, Edit2, Check, X } from 'lucide-react'

interface Props {
  user: UserProfile
  onRefresh: () => void
}

const INTERESTS = ['STEM', 'Business', 'CS', 'Math', 'Language', 'Research', 'Olympiads', 'Entrepreneurship', 'Science', 'Social Impact']
const GOALS_MAP: Record<string, string> = {
  university_abroad: 'Поступление за рубеж',
  olympiads: 'Олимпиады',
  startup: 'Стартап',
  research: 'Исследования',
}

export default function Dashboard({ user, onRefresh }: Props) {
  const isMentor = user.role === 'mentor'
  const [savedPosts, setSavedPosts] = useState<Post[]>([])
  const [editing, setEditing] = useState(false)
  const [nickname, setNickname] = useState(user.full_name ?? '')
  const [grade, setGrade] = useState<number | null>(user.grade)
  const [interests, setInterests] = useState<string[]>(user.interests)
  const [bio, setBio] = useState('')
  const [telegram, setTelegram] = useState('')
  const [phone, setPhone] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [saving, setSaving] = useState(false)

  const toggleSave = async (postId: string, currentlySaved: boolean) => {
    if (currentlySaved) {
      await api.unsavePost(postId, user.id)
      setSavedPosts(prev => prev.filter(p => p.id !== postId))
    } else {
      await api.savePost(postId, user.id)
      setSavedPosts(prev => prev.map(p => p.id === postId ? { ...p, is_saved: true } : p))
    }
  }

  useEffect(() => {
    api.getFeed(user.id).then(posts => setSavedPosts(posts.filter(p => p.is_saved)))
    if (isMentor) {
      api.getMentorProfile(user.id).then(profile => {
        if (profile) {
          setBio(profile.bio ?? '')
          setTelegram(profile.telegram ?? '')
          setPhone(profile.phone ?? '')
          setContactEmail(profile.contact_email ?? '')
        }
      })
    }
  }, [user.id, isMentor])

  const toggleInterest = (v: string) =>
    setInterests(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v])

  const cancelEdit = () => {
    setNickname(user.full_name ?? '')
    setGrade(user.grade)
    setInterests(user.interests)
    setEditing(false)
  }

  const saveProfile = async () => {
    setSaving(true)
    if (isMentor) {
      await api.updateOnboarding(user.id, { full_name: nickname })
      await api.saveMentorProfile({ user_id: user.id, full_name: nickname, bio, telegram, phone, contact_email: contactEmail })
    } else {
      await api.updateOnboarding(user.id, { full_name: nickname, grade, interests })
    }
    await onRefresh()
    setEditing(false)
    setSaving(false)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <LayoutDashboard size={24} className="text-primary-600" />
        Личный кабинет
      </h1>

      {/* Profile card */}
      <div className="card p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-300 to-primary-600 flex items-center justify-center text-white text-xl font-bold">
              {(user.full_name ?? user.email).charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="font-bold text-gray-900">{user.full_name ?? '—'}</h2>
              <p className="text-sm text-gray-500">{user.email}</p>
              {user.grade && (
                <span className="text-xs bg-primary-100 text-primary-700 font-semibold px-2.5 py-0.5 rounded-full mt-1 inline-block">
                  {user.grade} класс
                </span>
              )}
            </div>
          </div>
          {!editing && (
            <button onClick={() => setEditing(true)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500">
              <Edit2 size={16} />
            </button>
          )}
          {editing && (
            <div className="flex gap-2">
              <button onClick={saveProfile} disabled={saving} className="p-2 bg-primary-100 hover:bg-primary-200 rounded-xl transition-colors text-primary-700">
                <Check size={16} />
              </button>
              <button onClick={cancelEdit} className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500">
                <X size={16} />
              </button>
            </div>
          )}
        </div>

        {editing && (
          <div className="mb-4 space-y-3">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Имя</p>
              <input
                className="input"
                value={nickname}
                onChange={e => setNickname(e.target.value)}
                placeholder="Твоё имя"
              />
            </div>

            {isMentor ? (
              <>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">О себе</p>
                  <textarea
                    className="input resize-none"
                    rows={3}
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    placeholder="Расскажи студентам о своём опыте и чем можешь помочь"
                  />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Контакты</p>
                  <div className="space-y-2">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">@</span>
                      <input className="input pl-7" placeholder="Telegram username" value={telegram} onChange={e => setTelegram(e.target.value.replace('@', ''))} />
                    </div>
                    <input className="input" type="tel" placeholder="Номер телефона" value={phone} onChange={e => setPhone(e.target.value)} />
                    <input className="input" type="email" placeholder="Email для связи" value={contactEmail} onChange={e => setContactEmail(e.target.value)} />
                  </div>
                </div>
              </>
            ) : (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Класс</p>
                <div className="flex gap-2">
                  {[8, 9, 10, 11].map(g => (
                    <button
                      key={g}
                      onClick={() => setGrade(g)}
                      className={`flex-1 py-2 rounded-xl text-sm font-bold border-2 transition-all duration-150 ${
                        grade === g
                          ? 'border-primary-600 bg-primary-50 text-primary-700'
                          : 'border-gray-200 text-gray-600 hover:border-primary-300'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {isMentor ? (
          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">О себе</p>
              {bio ? <p className="text-sm text-gray-600 leading-relaxed">{bio}</p> : <span className="text-sm text-gray-400">Не указано</span>}
            </div>
            {(telegram || phone || contactEmail) && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Контакты</p>
                <div className="flex flex-col gap-1">
                  {telegram && <span className="text-sm text-primary-600">@{telegram}</span>}
                  {phone && <span className="text-sm text-gray-600">{phone}</span>}
                  {contactEmail && <span className="text-sm text-gray-600">{contactEmail}</span>}
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Интересы</p>
              {editing ? (
                <div className="flex flex-wrap gap-1.5">
                  {INTERESTS.map(i => (
                    <button
                      key={i}
                      onClick={() => toggleInterest(i)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-all duration-150 ${
                        interests.includes(i)
                          ? 'border-primary-600 bg-primary-600 text-white'
                          : 'border-gray-200 text-gray-600 hover:border-primary-300'
                      }`}
                    >
                      {i}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {user.interests.length > 0
                    ? user.interests.map(i => (
                        <span key={i} className="px-3 py-1 rounded-full text-xs font-medium bg-primary-50 text-primary-700">{i}</span>
                      ))
                    : <span className="text-sm text-gray-400">Не указаны</span>
                  }
                </div>
              )}
            </div>

            {user.goals.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Цели</p>
                <div className="flex flex-wrap gap-1.5">
                  {user.goals.map(g => (
                    <span key={g} className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                      {GOALS_MAP[g] ?? g}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Saved posts */}
      <h2 className="font-bold text-gray-900 mb-4">Сохранённые посты</h2>
      {savedPosts.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p className="text-sm">Пока ничего не сохранено</p>
        </div>
      )}
      <div className="grid gap-4">
        {savedPosts.map(post => (
          <PostCard
            key={post.id}
            post={post}
            currentUserId={user.id}
            onToggleSave={toggleSave}
          />
        ))}
      </div>
    </div>
  )
}
