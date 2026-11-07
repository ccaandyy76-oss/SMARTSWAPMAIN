'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'

interface AmountInputProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  showSlider?: boolean
  className?: string
}

export function AmountInput({
  value,
  onChange,
  min = 100,
  max = 50000,
  step = 100,
  showSlider = true,
  className,
}: AmountInputProps) {
  const [inputValue, setInputValue] = useState(formatNumber(value))

  useEffect(() => {
    setInputValue(formatNumber(value))
  }, [value])

  function formatNumber(num: number): string {
    return num.toLocaleString('en-IN')
  }

  function parseNumber(str: string): number {
    return parseInt(str.replace(/,/g, ''), 10) || 0
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^\d]/g, '')
    const num = parseInt(raw, 10) || 0
    const clamped = Math.min(Math.max(num, 0), max)
    setInputValue(formatNumber(clamped))
    onChange(clamped)
  }

  const handleSliderChange = (values: number[]) => {
    const newValue = values[0]
    setInputValue(formatNumber(newValue))
    onChange(newValue)
  }

  const handleBlur = () => {
    const num = parseNumber(inputValue)
    const clamped = Math.min(Math.max(num, min), max)
    setInputValue(formatNumber(clamped))
    onChange(clamped)
  }

  const isValid = value >= min && value <= max

  return (
    <div className={cn('space-y-4', className)}>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-medium text-muted-foreground">
          ₹
        </span>
        <Input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          className={cn(
            'pl-10 pr-4 h-14 text-2xl font-semibold bg-secondary border-border text-foreground',
            'focus:border-primary focus:ring-primary/20',
            !isValid && 'border-destructive focus:border-destructive focus:ring-destructive/20'
          )}
        />
      </div>

      {showSlider && (
        <div className="px-1">
          <Slider
            value={[value]}
            onValueChange={handleSliderChange}
            min={min}
            max={max}
            step={step}
            className="[&_[role=slider]]:bg-primary [&_[role=slider]]:border-primary [&_.bg-primary]:bg-primary"
          />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>₹{formatNumber(min)}</span>
            <span>₹{formatNumber(max)}</span>
          </div>
        </div>
      )}

      {!isValid && (
        <p className="text-sm text-destructive">
          Amount must be between ₹{formatNumber(min)} and ₹{formatNumber(max)}
        </p>
      )}
    </div>
  )
}
