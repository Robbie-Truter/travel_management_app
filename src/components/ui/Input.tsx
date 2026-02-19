import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-text-primary">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            'h-9 w-full rounded-lg border border-border bg-surface px-3 text-sm text-text-primary placeholder:text-text-muted transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-transparent',
            error && 'border-rose-pastel-400 focus:ring-rose-pastel-400',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-rose-pastel-500">{error}</p>}
        {hint && !error && <p className="text-xs text-text-muted">{hint}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-text-primary">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          className={cn(
            'w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted transition-colors resize-none',
            'focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-transparent',
            error && 'border-rose-pastel-400',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-rose-pastel-500">{error}</p>}
      </div>
    )
  }
)
Textarea.displayName = 'Textarea'

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, id, options, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-text-primary">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={id}
          className={cn(
            'h-9 w-full rounded-lg border border-border bg-surface px-3 text-sm text-text-primary transition-colors appearance-none cursor-pointer',
            'focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-transparent',
            error && 'border-rose-pastel-400',
            className
          )}
          {...props}
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-rose-pastel-500">{error}</p>}
      </div>
    )
  }
)
Select.displayName = 'Select'
