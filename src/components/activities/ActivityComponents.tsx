import { useState } from 'react'
import { motion } from 'framer-motion'
import { Compass, Clock, DollarSign, ExternalLink, Edit, Trash2, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardFooter } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal, ConfirmDialog } from '@/components/ui/Modal'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { formatCurrency, formatDuration } from '@/lib/utils'
import type { Activity } from '@/db/types'

interface ActivityCardProps {
  activity: Activity
  onEdit: (a: Activity) => void
  onDelete: (id: number) => void
  onConfirm: (id: number) => void
}

export function ActivityCard({ activity, onEdit, onDelete, onConfirm }: ActivityCardProps) {
  const [deleteOpen, setDeleteOpen] = useState(false)

  return (
    <>
      <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
        <Card className={activity.isConfirmed ? 'border-sage-300 dark:border-sage-700' : ''}>
          <CardContent className="pt-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-lavender-100 dark:bg-lavender-900/30 flex items-center justify-center flex-shrink-0">
                  <Compass size={16} className="text-lavender-500" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-[var(--color-text-primary)] truncate">{activity.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {activity.duration && (
                      <span className="text-xs text-[var(--color-text-muted)] flex items-center gap-1">
                        <Clock size={11} />{formatDuration(activity.duration)}
                      </span>
                    )}
                    {activity.cost !== undefined && activity.cost > 0 && (
                      <span className="text-xs text-[var(--color-text-muted)] flex items-center gap-1">
                        <DollarSign size={11} />{formatCurrency(activity.cost, activity.currency)}
                      </span>
                    )}
                    {activity.link && (
                      <a href={activity.link} target="_blank" rel="noopener noreferrer" className="text-xs text-sage-500 hover:underline flex items-center gap-1" onClick={e => e.stopPropagation()}>
                        <ExternalLink size={11} />Link
                      </a>
                    )}
                  </div>
                </div>
              </div>
              {activity.isConfirmed ? <Badge variant="confirmed"><CheckCircle size={10} />Confirmed</Badge> : <Badge variant="option">Option</Badge>}
            </div>
            {activity.notes && (
              <p className="mt-2 text-xs text-[var(--color-text-muted)] bg-[var(--color-surface-3)] rounded-lg px-3 py-2">{activity.notes}</p>
            )}
          </CardContent>
          <CardFooter className="justify-end">
            {!activity.isConfirmed && (
              <Button variant="ghost" size="sm" onClick={() => onConfirm(activity.id!)} className="text-sage-600">
                <CheckCircle size={14} />Confirm
              </Button>
            )}
            <Button variant="ghost" size="icon-sm" onClick={() => onEdit(activity)}><Edit size={14} /></Button>
            <Button variant="ghost" size="icon-sm" className="text-rose-pastel-400 hover:text-rose-pastel-500" onClick={() => setDeleteOpen(true)}>
              <Trash2 size={14} />
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => { onDelete(activity.id!); setDeleteOpen(false) }}
        title="Delete Activity"
        description={`Delete "${activity.title}"?`}
      />
    </>
  )
}

interface ActivityFormProps {
  open: boolean
  onClose: () => void
  onSave: (data: Omit<Activity, 'id' | 'createdAt'>) => Promise<void>
  initial?: Activity
  tripId: number
  defaultDate?: string
}

export function ActivityForm({ open, onClose, onSave, initial, tripId, defaultDate }: ActivityFormProps) {
  const [form, setForm] = useState({
    title: initial?.title ?? '',
    date: initial?.date ?? defaultDate ?? '',
    link: initial?.link ?? '',
    notes: initial?.notes ?? '',
    duration: initial?.duration?.toString() ?? '',
    cost: initial?.cost?.toString() ?? '',
    currency: initial?.currency ?? 'USD',
    isConfirmed: initial?.isConfirmed ?? false,
    order: initial?.order ?? 0,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const CURRENCIES = [
    { value: 'USD', label: 'USD' },
    { value: 'EUR', label: 'EUR' },
    { value: 'ZAR', label: 'ZAR' }
  ]

  const set = (k: string, v: string | boolean | number) => setForm(f => ({ ...f, [k]: v }))

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.title.trim()) e.title = 'Required'
    if (!form.date) e.date = 'Required'
    return e
  }

  const handleSave = async () => {
    const e = validate()
    if (Object.keys(e).length > 0) { setErrors(e); return }
    setSaving(true)
    await onSave({
      tripId,
      title: form.title,
      date: form.date,
      link: form.link || undefined,
      notes: form.notes || undefined,
      duration: form.duration ? Number(form.duration) : undefined,
      cost: form.cost ? Number(form.cost) : undefined,
      currency: form.currency,
      isConfirmed: form.isConfirmed,
      order: form.order,
    })
    setSaving(false)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? 'Edit Activity' : 'Add Activity'}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input id="act-title" label="Activity Title" placeholder="e.g. Visit Senso-ji Temple" value={form.title} onChange={e => set('title', e.target.value)} error={errors.title} />
        <Input id="act-date" label="Date" type="date" value={form.date} onChange={e => set('date', e.target.value)} error={errors.date} />
        <div className="grid grid-cols-2 gap-3">
          <Input id="act-dur" label="Duration (minutes)" type="number" placeholder="e.g. 90" value={form.duration} onChange={e => set('duration', e.target.value)} />
          <Input id="act-cost" label="Estimated Cost" type="number" placeholder="0.00" value={form.cost} onChange={e => set('cost', e.target.value)} />
        </div>
        <Select id="act-currency" label="Currency" value={form.currency} options={CURRENCIES} onChange={e => set('currency', e.target.value)} />
        <Input id="act-link" label="Link (optional)" placeholder="https://..." value={form.link} onChange={e => set('link', e.target.value)} />
        <Textarea id="act-notes" label="Notes (optional)" value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} />
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.isConfirmed} onChange={e => set('isConfirmed', e.target.checked)} className="rounded" />
          <span className="text-sm text-text-primary">Mark as confirmed</span>
        </label>
      </div>
    </Modal>
  )
}
