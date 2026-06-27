'use client'

import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SelectOption {
  value: string
  label: string
  icon?: React.ReactNode
}

interface CustomSelectProps {
  options: SelectOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function CustomSelect({ 
  options, 
  value, 
  onChange, 
  placeholder = 'Select...', 
  className = '',
  disabled = false
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find(opt => opt.value === value)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className={cn('relative', className)} ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="focus-ring flex min-h-12 w-full items-center justify-between rounded-[var(--radius-control)] border border-border bg-card px-3 py-2 text-sm font-medium text-foreground surface-flat hover:border-primary/40 hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2 truncate">
          {selectedOption?.icon && <span className="text-muted-foreground">{selectedOption.icon}</span>}
          <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        </div>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 max-h-60 min-w-full w-max overflow-y-auto overflow-x-visible rounded-[var(--radius-card)] border bg-popover text-popover-foreground surface-overlay outline-none animate-in fade-in zoom-in-95">
          <div className="p-1">
            {options.map((option) => (
              <div
                key={option.value}
                role="option"
                aria-selected={option.value === value}
                tabIndex={0}
                className={cn(
                  'relative flex min-h-10 w-full cursor-default select-none items-center whitespace-nowrap rounded-md py-2 pl-8 pr-3 text-sm outline-none hover:bg-primary/7 hover:text-primary',
                  option.value === value && 'bg-primary/10 text-primary font-semibold'
                )}
                onClick={() => {
                  onChange(option.value)
                  setIsOpen(false)
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    onChange(option.value)
                    setIsOpen(false)
                  }
                }}
              >
                {option.value === value && (
                  <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                    <Check className="h-4 w-4" />
                  </span>
                )}
                <div className="flex shrink-0 items-center gap-2">
                  {option.icon && <span className="shrink-0 text-muted-foreground">{option.icon}</span>}
                  <span className="whitespace-nowrap">{option.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
