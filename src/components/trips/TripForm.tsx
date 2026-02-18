import { useState, useRef } from 'react'
import { Image, X } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { fileToBase64 } from '@/lib/utils'
import type { Trip, TripStatus } from '@/db/types'

const STATUS_OPTIONS = [
  { value: 'planning', label: 'Planning' },
  { value: 'booked', label: 'Booked' },
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

interface TripFormProps {
  open: boolean
  onClose: () => void
  onSave: (data: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  initial?: Trip
}

export function TripForm({ open, onClose, onSave, initial }: TripFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [destination, setDestination] = useState(initial?.destination ?? '')
  const [startDate, setStartDate] = useState(initial?.startDate ?? '')
  const [endDate, setEndDate] = useState(initial?.endDate ?? '')
  const [status, setStatus] = useState<TripStatus>(initial?.status ?? 'planning')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [coverImage, setCoverImage] = useState<string | undefined>(initial?.coverImage)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validate = () => {
    const e: Record<string, string> = {}
    if (!name.trim()) e.name = 'Trip name is required'
    if (!destination.trim()) e.destination = 'Destination is required'
    if (!startDate) e.startDate = 'Start date is required'
    if (!endDate) e.endDate = 'End date is required'
    if (startDate && endDate && endDate < startDate) e.endDate = 'End date must be after start date'
    return e
  }

  const handleSave = async () => {
    const e = validate()
    if (Object.keys(e).length > 0) { setErrors(e); return }
    setSaving(true)
    await onSave({ name, destination, startDate, endDate, status, description, coverImage })
    setSaving(false)
    onClose()
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const base64 = await fileToBase64(file)
    setCoverImage(base64)
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? 'Edit Trip' : 'New Trip'}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : initial ? 'Save Changes' : 'Create Trip'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Cover image */}
        <div>
          <label className="text-sm font-medium text-[var(--color-text-primary)] block mb-1.5">
            Cover Image
          </label>
          <div
            className="relative h-32 rounded-xl border-2 border-dashed border-[var(--color-border)] overflow-hidden cursor-pointer hover:border-sage-400 transition-colors group"
            onClick={() => fileInputRef.current?.click()}
          >
            {coverImage ? (
              <>
                <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 text-white text-sm font-medium">Change Image</span>
                </div>
                <button
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                  onClick={(e) => { e.stopPropagation(); setCoverImage(undefined) }}
                >
                  <X size={12} />
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-[var(--color-text-muted)]">
                <Image size={24} />
                <span className="text-sm">Click to upload a cover image</span>
              </div>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        </div>

        <Input
          id="trip-name"
          label="Trip Name"
          placeholder="e.g. Summer in Japan"
          value={name}
          onChange={e => setName(e.target.value)}
          error={errors.name}
        />
        <Input
          id="trip-destination"
          label="Destination"
          placeholder="e.g. Tokyo, Japan"
          value={destination}
          onChange={e => setDestination(e.target.value)}
          error={errors.destination}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            id="trip-start"
            label="Start Date"
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            error={errors.startDate}
          />
          <Input
            id="trip-end"
            label="End Date"
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            error={errors.endDate}
          />
        </div>
        <Select
          id="trip-status"
          label="Status"
          value={status}
          onChange={e => setStatus(e.target.value as TripStatus)}
          options={STATUS_OPTIONS}
        />
        <Textarea
          id="trip-description"
          label="Description (optional)"
          placeholder="What's this trip about?"
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={3}
        />
      </div>
    </Modal>
  )
}
