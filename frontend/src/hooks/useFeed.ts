import { useEffect, useState } from 'react'
import { api, Post } from '../lib/api'

export function useFeed(userId: string | undefined) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) return
    setLoading(true)
    api.getFeed(userId)
      .then(setPosts)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [userId])

  const toggleSave = async (postId: string, currentlySaved: boolean) => {
    if (!userId) return
    if (currentlySaved) {
      await api.unsavePost(postId, userId)
    } else {
      await api.savePost(postId, userId)
    }
    setPosts(prev =>
      prev.map(p =>
        p.id === postId
          ? { ...p, is_saved: !currentlySaved, saves_count: p.saves_count + (currentlySaved ? -1 : 1) }
          : p
      )
    )
  }

  const updatePost = (updated: Post) =>
    setPosts(prev => prev.map(p => p.id === updated.id ? { ...p, ...updated } : p))

  const deletePost = (postId: string) =>
    setPosts(prev => prev.filter(p => p.id !== postId))

  return { posts, loading, error, toggleSave, updatePost, deletePost }
}
