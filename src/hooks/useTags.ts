import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Tag } from '../types'

export function useTags() {
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTags = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('name')

      if (error) throw error
      setTags(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTags()
  }, [])

  return { tags, loading, error, refetch: fetchTags }
}