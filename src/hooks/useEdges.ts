import { useEffect, useState, useCallback } from 'react'
import {
  subscribeToEdges,
  createEdge,
  updateEdge,
  deleteEdge,
} from '@/services/firestore.service'
import type { EdgeData } from '@/types'

export const useEdges = (userId: string | null) => {
  const [edges, setEdges] = useState<EdgeData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setEdges([])
      setLoading(false)
      return
    }

    setLoading(true)
    const unsubscribe = subscribeToEdges(userId, (data) => {
      setEdges(data)
      setLoading(false)
    })

    return unsubscribe
  }, [userId])

  const addEdge = useCallback(
    async (data: Omit<EdgeData, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<EdgeData | null> => {
      if (!userId) return null
      // Prevent duplicate edges
      const exists = edges.some(
        (e) =>
          (e.sourceId === data.sourceId && e.targetId === data.targetId) ||
          (e.sourceId === data.targetId && e.targetId === data.sourceId)
      )
      if (exists) {
        setError('A connection between these nodes already exists.')
        return null
      }
      try {
        return await createEdge(userId, data)
      } catch {
        setError('Failed to create connection.')
        return null
      }
    },
    [userId, edges]
  )

  const editEdge = useCallback(async (edgeId: string, data: Partial<EdgeData>): Promise<boolean> => {
    try {
      await updateEdge(edgeId, data)
      return true
    } catch {
      setError('Failed to update connection.')
      return false
    }
  }, [])

  const removeEdge = useCallback(async (edgeId: string): Promise<boolean> => {
    try {
      await deleteEdge(edgeId)
      return true
    } catch {
      setError('Failed to delete connection.')
      return false
    }
  }, [])

  const getEdgesForNode = useCallback(
    (nodeId: string) =>
      edges.filter((e) => e.sourceId === nodeId || e.targetId === nodeId),
    [edges]
  )

  const getEdgeBetween = useCallback(
    (sourceId: string, targetId: string) =>
      edges.find(
        (e) =>
          (e.sourceId === sourceId && e.targetId === targetId) ||
          (e.sourceId === targetId && e.targetId === sourceId)
      ) ?? null,
    [edges]
  )

  return {
    edges,
    loading,
    error,
    addEdge,
    editEdge,
    removeEdge,
    getEdgesForNode,
    getEdgeBetween,
    clearError: () => setError(null),
  }
}
