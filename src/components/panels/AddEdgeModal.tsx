import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { EDGE_TYPE_LABELS } from '@/utils/node.utils'
import type { EdgeData, EdgeType, RelationshipStrength, NodeData } from '@/types'

interface AddEdgeModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: Omit<EdgeData, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>
  nodes: NodeData[]
  preSelectedSource?: string | null
  preSelectedTarget?: string | null
}

const EDGE_TYPE_OPTIONS = (Object.keys(EDGE_TYPE_LABELS) as EdgeType[]).map((k) => ({
  value: k,
  label: EDGE_TYPE_LABELS[k],
}))

const STRENGTH_OPTIONS = [
  { value: 'weak', label: 'Weak' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'strong', label: 'Strong' },
]

export const AddEdgeModal = ({
  open,
  onClose,
  onSubmit,
  nodes,
  preSelectedSource,
  preSelectedTarget,
}: AddEdgeModalProps) => {
  const [sourceId, setSourceId] = useState(preSelectedSource ?? '')
  const [targetId, setTargetId] = useState(preSelectedTarget ?? '')
  const [type, setType] = useState<EdgeType>('introduction')
  const [strength, setStrength] = useState<RelationshipStrength>('moderate')
  const [label, setLabel] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const nodeOptions = nodes.map((n) => ({ value: n.id, label: n.label }))
  nodeOptions.unshift({ value: '', label: 'Select a node...' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!sourceId || !targetId) {
      setError('Please select both source and target nodes.')
      return
    }
    if (sourceId === targetId) {
      setError('Source and target must be different nodes.')
      return
    }
    setError('')
    setLoading(true)
    await onSubmit({
      sourceId,
      targetId,
      type,
      strength,
      label: label.trim() || undefined,
      notes: notes.trim() || undefined,
    })
    setLoading(false)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Connection" size="md">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <Select
            label="From Node *"
            options={nodeOptions}
            value={sourceId}
            onChange={(e) => setSourceId(e.target.value)}
            required
          />
          <Select
            label="To Node *"
            options={nodeOptions}
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Relationship Type"
            options={EDGE_TYPE_OPTIONS}
            value={type}
            onChange={(e) => setType(e.target.value as EdgeType)}
          />
          <Select
            label="Strength"
            options={STRENGTH_OPTIONS}
            value={strength}
            onChange={(e) => setStrength(e.target.value as RelationshipStrength)}
          />
        </div>

        <Input
          label="Label (optional)"
          placeholder='e.g. "Introduced at SaaS Summit"'
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />

        <Textarea
          label="Notes"
          placeholder="Context about this connection..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        {error && (
          <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">
            {error}
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <Button variant="ghost" type="button" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button variant="primary" type="submit" loading={loading} className="flex-1">
            Add Connection
          </Button>
        </div>
      </form>
    </Modal>
  )
}
