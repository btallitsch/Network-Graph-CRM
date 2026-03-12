import { useEffect, useState, useCallback } from 'react'
import {
  subscribeToNodes,
  createNode,
  updateNode,
  deleteNode,
  deleteEdgesForNode,
} from '@/services/firestore.service'
import type { NodeData, NodeType } from '@/types'

export const useNodes = (userId: string | null) => {
  const [nodes, setNodes] = useState<NodeData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setNodes([])
      setLoading(false)
      return
    }

    setLoading(true)
    const unsubscribe = subscribeToNodes(userId, (data) => {
      setNodes(data)
      setLoading(false)
    })

    return unsubscribe
  }, [userId])

  const addNode = useCallback(
    async (data: Omit<NodeData, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<NodeData | null> => {
      if (!userId) return null
      try {
        return await createNode(userId, data)
      } catch (err) {
        setError('Failed to create node.')
        return null
      }
    },
    [userId]
  )

  const editNode = useCallback(
    async (nodeId: string, data: Partial<NodeData>): Promise<boolean> => {
      try {
        await updateNode(nodeId, data)
        return true
      } catch {
        setError('Failed to update node.')
        return false
      }
    },
    []
  )

  const removeNode = useCallback(
    async (nodeId: string): Promise<boolean> => {
      if (!userId) return false
      try {
        await Promise.all([deleteNode(nodeId), deleteEdgesForNode(nodeId, userId)])
        return true
      } catch {
        setError('Failed to delete node.')
        return false
      }
    },
    [userId]
  )

  const getNodesByType = useCallback(
    (type: NodeType) => nodes.filter((n) => n.type === type),
    [nodes]
  )

  const searchNodes = useCallback(
    (query: string) => {
      if (!query.trim()) return nodes
      const q = query.toLowerCase()
      return nodes.filter(
        (n) =>
          n.label.toLowerCase().includes(q) ||
          n.description?.toLowerCase().includes(q) ||
          n.tags.some((t) => t.toLowerCase().includes(q))
      )
    },
    [nodes]
  )

  return {
    nodes,
    loading,
    error,
    addNode,
    editNode,
    removeNode,
    getNodesByType,
    searchNodes,
    clearError: () => setError(null),
  }
}
