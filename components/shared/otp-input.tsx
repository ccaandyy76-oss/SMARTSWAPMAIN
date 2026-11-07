'use client'

import { useState, useRef, useEffect, type KeyboardEvent, type ClipboardEvent } from 'react'
import { cn } from '@/lib/utils'

interface OTPInputProps {
  length?: number
  value?: string
  onChange?: (value: string) => void
  onComplete?: (value: string) => void
  disabled?: boolean
  className?: string
  autoFocus?: boolean
}

export function OTPInput({
  length = 6,
  value = '',
  onChange,
  onComplete,
  disabled = false,
  className,
  autoFocus = true,
}: OTPInputProps) {
  const [otp, setOtp] = useState<string[]>(value.split('').concat(Array(length - value.length).fill('')))
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [autoFocus])

  useEffect(() => {
    const newOtp = value.split('').concat(Array(length - value.length).fill(''))
    setOtp(newOtp.slice(0, length))
  }, [value, length])

  const handleChange = (index: number, digit: string) => {
    if (!/^\d*$/.test(digit)) return

    const newOtp = [...otp]
    newOtp[index] = digit.slice(-1)
    setOtp(newOtp)

    const otpString = newOtp.join('')
    onChange?.(otpString)

    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }

    if (newOtp.every(d => d !== '') && otpString.length === length) {
      onComplete?.(otpString)
    }
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    
    if (pastedData) {
      const newOtp = pastedData.split('').concat(Array(length - pastedData.length).fill(''))
      setOtp(newOtp.slice(0, length))
      onChange?.(pastedData)
      
      const focusIndex = Math.min(pastedData.length, length - 1)
      inputRefs.current[focusIndex]?.focus()
      
      if (pastedData.length === length) {
        onComplete?.(pastedData)
      }
    }
  }

  return (
    <div className={cn('flex gap-2 sm:gap-3', className)}>
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={el => { inputRefs.current[index] = el }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={otp[index] || ''}
          onChange={e => handleChange(index, e.target.value)}
          onKeyDown={e => handleKeyDown(index, e)}
          onPaste={handlePaste}
          disabled={disabled}
          className={cn(
            'w-10 h-12 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-mono',
            'bg-secondary border-2 border-border rounded-lg',
            'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20',
            'transition-all duration-200',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            otp[index] && 'border-primary/50 text-primary'
          )}
          aria-label={`OTP digit ${index + 1}`}
        />
      ))}
    </div>
  )
}

interface OTPDisplayProps {
  otp: string
  className?: string
}

export function OTPDisplay({ otp, className }: OTPDisplayProps) {
  return (
    <div className={cn('flex gap-2 sm:gap-3 justify-center', className)}>
      {otp.split('').map((digit, index) => (
        <div
          key={index}
          className={cn(
            'w-12 h-14 sm:w-16 sm:h-20 flex items-center justify-center',
            'text-2xl sm:text-4xl font-mono font-bold text-primary',
            'bg-secondary border-2 border-primary/30 rounded-lg',
            'animate-glow'
          )}
        >
          {digit}
        </div>
      ))}
    </div>
  )
}

interface CountdownTimerProps {
  seconds: number
  onExpire?: () => void
  className?: string
}

export function CountdownTimer({ seconds: initialSeconds, onExpire, className }: CountdownTimerProps) {
  const [seconds, setSeconds] = useState(initialSeconds)
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    if (seconds <= 0) {
      setIsExpired(true)
      onExpire?.()
      return
    }

    const timer = setInterval(() => {
      setSeconds(prev => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [seconds, onExpire])

  const radius = 45
  const circumference = 2 * Math.PI * radius
  const progress = (seconds / initialSeconds) * circumference

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg className="w-24 h-24 sm:w-32 sm:h-32 -rotate-90">
        <circle
          cx="50%"
          cy="50%"
          r={radius}
          className="fill-none stroke-secondary"
          strokeWidth="6"
        />
        <circle
          cx="50%"
          cy="50%"
          r={radius}
          className={cn(
            'fill-none transition-all duration-1000',
            isExpired ? 'stroke-destructive' : 'stroke-primary'
          )}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={cn(
          'text-2xl sm:text-3xl font-bold font-mono',
          isExpired ? 'text-destructive' : 'text-primary'
        )}>
          {isExpired ? '0:00' : `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`}
        </span>
      </div>
    </div>
  )
}
