import { type InputHTMLAttributes, type TextareaHTMLAttributes, type ReactNode, forwardRef } from 'react'
import { clsx } from 'clsx'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: ReactNode
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

const baseInput =
  'w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-slate-200 font-body placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-teal-500/60 focus:border-teal-500/60 transition-colors duration-200'

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-mono text-slate-400 uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          className={clsx(baseInput, icon && 'pl-9', error && 'border-red-500/50', className)}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-400 font-body">{error}</p>}
    </div>
  )
)
Input.displayName = 'Input'

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-mono text-slate-400 uppercase tracking-wider">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        rows={3}
        className={clsx(baseInput, 'resize-none', error && 'border-red-500/50', className)}
        {...props}
      />
      {error && <p className="text-xs text-red-400 font-body">{error}</p>}
    </div>
  )
)
Textarea.displayName = 'Textarea'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-mono text-slate-400 uppercase tracking-wider">
          {label}
        </label>
      )}
      <select
        ref={ref}
        className={clsx(
          baseInput,
          'cursor-pointer [&>option]:bg-surface',
          error && 'border-red-500/50',
          className
        )}
        {...props}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-400 font-body">{error}</p>}
    </div>
  )
)
Select.displayName = 'Select'
