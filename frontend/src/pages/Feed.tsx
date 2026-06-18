import { useFeed } from '../hooks/useFeed'
import { UserProfile } from '../lib/api'
import PostCard from '../components/PostCard'
import { Rss } from 'lucide-react'
import { useLang } from '../contexts/LangContext'

interface Props {
  user: UserProfile
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-card">
      <div className="aspect-video skeleton" />
      <div className="p-5 space-y-3">
        <div className="h-4 skeleton rounded-full w-1/3" />
        <div className="h-5 skeleton rounded-full w-3/4" />
        <div className="h-4 skeleton rounded-full w-full" />
        <div className="h-4 skeleton rounded-full w-2/3" />
      </div>
    </div>
  )
}

export default function Feed({ user }: Props) {
  const { posts, loading, error, toggleSave, updatePost, deletePost } = useFeed(user.id)
  const { t } = useLang()

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 md:px-0">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {t('feed.hi', { name: user.full_name?.split(' ')[0] ?? '' })}
      </h1>

      {loading && (
        <div className="grid gap-5">
          {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
        </div>
      )}

      {error && (
        <div className="text-center py-16">
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      )}

      {!loading && !error && posts.length === 0 && (
        <div className="text-center py-20">
          <Rss size={48} className="mx-auto text-gray-200 mb-4" />
          <h3 className="font-semibold text-gray-700 mb-2">{t('feed.empty')}</h3>
          <p className="text-sm text-gray-400">{t('feed.hint')}</p>
        </div>
      )}

      {!loading && posts.length > 0 && (
        <div className="grid gap-5">
          {posts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={user.id}
              onToggleSave={toggleSave}
              onUpdate={updatePost}
              onDelete={deletePost}
            />
          ))}
        </div>
      )}
    </div>
  )
}
