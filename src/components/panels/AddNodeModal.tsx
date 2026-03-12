import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { NODE_ICONS, NODE_COLORS } from '@/utils/node.utils'
import type { NodeData, NodeType, OpportunityStage, ProjectStatus } from '@/types'

interface AddNodeModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: Omit<NodeData, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>
  editNode?: NodeData | null
}

const TYPE_OPTIONS = [
  { value: 'person', label: '👤 Person' },
  { value: 'company', label: '🏢 Company' },
  { value: 'opportunity', label: '💎 Opportunity' },
  { value: 'project', label: '⚡ Project' },
]

const STAGE_OPTIONS = [
  { value: 'prospect', label: 'Prospect' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'proposal', label: 'Proposal' },
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'closed_won', label: 'Closed Won' },
  { value: 'closed_lost', label: 'Closed Lost' },
]

const STATUS_OPTIONS = [
  { value: 'planning', label: 'Planning' },
  { value: 'active', label: 'Active' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

export const AddNodeModal = ({ open, onClose, onSubmit, editNode }: AddNodeModalProps) => {
  const [type, setType] = useState<NodeType>(editNode?.type ?? 'person')
  const [label, setLabel] = useState(editNode?.label ?? '')
  const [description, setDescription] = useState(editNode?.description ?? '')
  const [email, setEmail] = useState(editNode?.email ?? '')
  const [phone, setPhone] = useState(editNode?.phone ?? '')
  const [website, setWebsite] = useState(editNode?.website ?? '')
  const [title, setTitle] = useState(editNode?.title ?? '')
  const [company, setCompany] = useState(editNode?.company ?? '')
  const [industry, setIndustry] = useState(editNode?.industry ?? '')
  const [value, setValue] = useState(editNode?.value?.toString() ?? '')
  const [stage, setStage] = useState<OpportunityStage>(editNode?.stage ?? 'prospect')
  const [status, setStatus] = useState<ProjectStatus>(editNode?.status ?? 'planning')
  const [tagsInput, setTagsInput] = useState(editNode?.tags.join(', ') ?? '')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!label.trim()) return

    setLoading(true)
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    const data: Omit<NodeData, 'id' | 'userId' | 'createdAt' | 'updatedAt'> = {
      type,
      label: label.trim(),
      description: description.trim() || undefined,
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      website: website.trim() || undefined,
      tags,
      ...(type === 'person' && {
        title: title.trim() || undefined,
        company: company.trim() || undefined,
      }),
      ...(type === 'company' && {
        industry: industry.trim() || undefined,
      }),
      ...(type === 'opportunity' && {
        value: value ? parseFloat(value) : undefined,
        stage,
      }),
      ...(type === 'project' && {
        status,
      }),
    }

    await onSubmit(data)
    setLoading(false)
    onClose()
  }

  const color = NODE_COLORS[type]

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editNode ? 'Edit Node' : 'Add Node'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Type selector */}
        <div className="flex gap-2">
          {(['person', 'company', 'opportunity', 'project'] as NodeType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className="flex-1 py-2 rounded-lg text-xs font-mono border transition-all duration-200"
              style={{
                borderColor: type === t ? `${NODE_COLORS[t]}60` : '#1E2D42',
                backgroundColor: type === t ? `${NODE_COLORS[t]}10` : 'transparent',
                color: type === t ? NODE_COLORS[t] : '#64748B',
              }}
            >
              {NODE_ICONS[t]} {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        <Input
          label="Name / Label *"
          placeholder={type === 'person' ? 'Sarah Chen' : type === 'company' ? 'Acme Corp' : type === 'opportunity' ? 'Enterprise Deal Q1' : 'Website Redesign'}
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          required
        />

        <Textarea
          label="Description"
          placeholder="Brief notes about this node..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {type === 'person' && (
          <div className="grid grid-cols-2 gap-3">
            <Input label="Job Title" placeholder="CTO" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Input label="Company" placeholder="Acme Corp" value={company} onChange={(e) => setCompany(e.target.value)} />
          </div>
        )}

        {type === 'company' && (
          <Input label="Industry" placeholder="SaaS / Fintech / Healthcare" value={industry} onChange={(e) => setIndustry(e.target.value)} />
        )}

        {type === 'opportunity' && (
          <div className="grid grid-cols-2 gap-3">
            <Input label="Deal Value ($)" type="number" placeholder="50000" value={value} onChange={(e) => setValue(e.target.value)} />
            <Select label="Stage" options={STAGE_OPTIONS} value={stage} onChange={(e) => setStage(e.target.value as OpportunityStage)} />
          </div>
        )}

        {type === 'project' && (
          <Select label="Status" options={STATUS_OPTIONS} value={status} onChange={(e) => setStatus(e.target.value as ProjectStatus)} />
        )}

        <div className="grid grid-cols-2 gap-3">
          <Input label="Email" type="email" placeholder="contact@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input label="Phone" placeholder="+1 555 000 0000" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>

        <Input label="Website" placeholder="https://example.com" value={website} onChange={(e) => setWebsite(e.target.value)} />

        <Input
          label="Tags (comma separated)"
          placeholder="investor, advisor, warm-lead"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
        />

        <div className="flex gap-3 pt-2">
          <Button variant="ghost" type="button" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            loading={loading}
            className="flex-1"
            style={{ borderColor: `${color}60`, boxShadow: `0 0 12px ${color}20` }}
          >
            {editNode ? 'Save Changes' : 'Add Node'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
