import { NextResponse } from 'next/server'
import {
  isValidEmail,
  isValidIndianMobile,
  normalizeEmail,
  normalizeIndianPhone,
} from '@/lib/auth-contact'

type Channel = 'phone' | 'email'

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }

    const channel = (body as { channel?: string }).channel as Channel | undefined
    if (channel !== 'phone' && channel !== 'email') {
      return NextResponse.json({ error: 'Invalid channel' }, { status: 400 })
    }

    if (channel === 'phone') {
      const raw = String((body as { phone?: string }).phone ?? '')
      const phone = normalizeIndianPhone(raw)
      if (!isValidIndianMobile(phone)) {
        return NextResponse.json(
          { error: 'Invalid phone number format' },
          { status: 400 }
        )
      }
      // Integrate your SMS provider here, e.g. Twilio / MSG91
      // await sendPhoneOtp(phone)
      return NextResponse.json({ ok: true, channel: 'phone' })
    }

    const rawEmail = String((body as { email?: string }).email ?? '')
    const email = normalizeEmail(rawEmail)
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }
    // Integrate your email OTP provider here, e.g. SendGrid + your mailer
    // await sendEmailOtp(email)
    return NextResponse.json({ ok: true, channel: 'email' })
  } catch {
    return NextResponse.json(
      { error: 'OTP send failed. Please try again.' },
      { status: 500 }
    )
  }
}
