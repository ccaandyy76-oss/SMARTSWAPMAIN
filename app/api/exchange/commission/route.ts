import { NextResponse } from 'next/server'
import { z } from 'zod'

const bodySchema = z.object({
  amount: z.number().positive(),
  exchangeType: z.enum(['cash-to-online', 'online-to-cash']),
  commissionRatePercent: z.number().min(0).max(100),
})

/**
 * Server-side commission and leg amounts — clients should use this for display;
 * persisted transaction amounts should match these values when creating records server-side.
 */
export async function POST(req: Request) {
  try {
    const json = await req.json()
    const parsed = bodySchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const { amount, exchangeType, commissionRatePercent } = parsed.data
    const commission = Math.round(amount * (commissionRatePercent / 100) * 100) / 100

    if (exchangeType === 'cash-to-online') {
      const amountReceived = Math.round((amount - commission) * 100) / 100
      return NextResponse.json({
        commission,
        amountGiven: amount,
        amountReceived,
        summary: `You give ₹${amount} cash → You receive ₹${amountReceived} online (after ₹${commission} merchant commission)`,
      })
    }

    const amountPaid = Math.round((amount + commission) * 100) / 100
    return NextResponse.json({
      commission,
      amountGiven: amountPaid,
      amountReceived: amount,
      summary: `You send ₹${amountPaid} online → You receive ₹${amount} cash (₹${commission} merchant commission included)`,
    })
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }
}
