import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  onSnapshot,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from '@/config/firebase'
import type { NodeData, EdgeData, NodeType } from '@/types'

// ─── Collection References ─────────────────────────────────────────────────────

const nodesCol = collection(db, 'nodes')
const edgesCol = collection(db, 'edges')

// ─── Helpers ───────────────────────────────────────────────────────────────────

const now = () => new Date().toISOString()

const stripUndefined = <T extends object>(obj: T): Partial<T> => {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  ) as Partial<T>
}

const byCreatedAtDesc = (a: { createdAt: string }, b: { createdAt: string }) =>
  b.createdAt.localeCompare(a.createdAt)

// ─── Nodes ─────────────────────────────────────────────────────────────────────

export const createNode = async (
  userId: string,
  data: Omit<NodeData, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<NodeData> => {
  const payload: Omit<NodeData, 'id'> = {
    ...stripUndefined(data) as typeof data,
    tags: data.tags ?? [],
    userId,
    createdAt: now(),
    updatedAt: now(),
  }
  const ref = await addDoc(nodesCol, payload)
  return { ...payload, id: ref.id }
}

export const updateNode = async (
  nodeId: string,
  data: Partial<Omit<NodeData, 'id' | 'userId' | 'createdAt'>>
): Promise<void> => {
  const ref = doc(nodesCol, nodeId)
  await updateDoc(ref, { ...stripUndefined(data), updatedAt: now() })
}

export const deleteNode = async (nodeId: string): Promise<void> => {
  await deleteDoc(doc(nodesCol, nodeId))
}

export const getNode = async (nodeId: string): Promise<NodeData | null> => {
  const snap = await getDoc(doc(nodesCol, nodeId))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as NodeData
}

export const getUserNodes = async (userId: string): Promise<NodeData[]> => {
  const q = query(nodesCol, where('userId', '==', userId))
  const snap = await getDocs(q)
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() } as NodeData))
    .sort(byCreatedAtDesc)
}

export const subscribeToNodes = (
  userId: string,
  callback: (nodes: NodeData[]) => void
): Unsubscribe => {
  // Only filter by userId — no orderBy avoids the need for a composite index
  const q = query(nodesCol, where('userId', '==', userId))
  return onSnapshot(q, (snap) => {
    const nodes = snap.docs
      .map((d) => ({ id: d.id, ...d.data() } as NodeData))
      .sort(byCreatedAtDesc)
    callback(nodes)
  })
}

// ─── Edges ─────────────────────────────────────────────────────────────────────

export const createEdge = async (
  userId: string,
  data: Omit<EdgeData, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<EdgeData> => {
  const payload: Omit<EdgeData, 'id'> = {
    ...stripUndefined(data) as typeof data,
    userId,
    createdAt: now(),
    updatedAt: now(),
  }
  const ref = await addDoc(edgesCol, payload)
  return { ...payload, id: ref.id }
}

export const updateEdge = async (
  edgeId: string,
  data: Partial<Omit<EdgeData, 'id' | 'userId' | 'createdAt'>>
): Promise<void> => {
  const ref = doc(edgesCol, edgeId)
  await updateDoc(ref, { ...stripUndefined(data), updatedAt: now() })
}

export const deleteEdge = async (edgeId: string): Promise<void> => {
  await deleteDoc(doc(edgesCol, edgeId))
}

export const deleteEdgesForNode = async (nodeId: string, userId: string): Promise<void> => {
  const q1 = query(edgesCol, where('userId', '==', userId), where('sourceId', '==', nodeId))
  const q2 = query(edgesCol, where('userId', '==', userId), where('targetId', '==', nodeId))
  const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)])
  const deletions = [...snap1.docs, ...snap2.docs].map((d) => deleteDoc(d.ref))
  await Promise.all(deletions)
}

export const subscribeToEdges = (
  userId: string,
  callback: (edges: EdgeData[]) => void
): Unsubscribe => {
  const q = query(edgesCol, where('userId', '==', userId))
  return onSnapshot(q, (snap) => {
    const edges = snap.docs
      .map((d) => ({ id: d.id, ...d.data() } as EdgeData))
      .sort(byCreatedAtDesc)
    callback(edges)
  })
}

// ─── Batch helpers ─────────────────────────────────────────────────────────────

export const getNodesByType = async (userId: string, type: NodeType): Promise<NodeData[]> => {
  const q = query(nodesCol, where('userId', '==', userId), where('type', '==', type))
  const snap = await getDocs(q)
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() } as NodeData))
    .sort(byCreatedAtDesc)
}
