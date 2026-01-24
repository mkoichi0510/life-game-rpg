import { NextRequest, NextResponse } from 'next/server'
import { dayKeyParamSchema } from '@/lib/validations/result'
import {
  formatInternalError,
  formatZodError,
} from '@/lib/validations/helpers'
import { confirmDay } from '@/lib/domains/result'

/**
 * POST /api/results/:dayKey/confirm
 * 日次確定
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ dayKey?: string }> }
) {
  try {
    const { dayKey } = await params
    const result = dayKeyParamSchema.safeParse({ dayKey: dayKey ?? '' })

    if (!result.success) {
      return formatZodError(result.error)
    }

    await confirmDay(result.data.dayKey)

    return NextResponse.json({ ok: true })
  } catch (error) {
    if (
      error instanceof Error &&
      (error as Error & { code?: string }).code === 'ALREADY_CONFIRMED'
    ) {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_OPERATION',
            message: '既に確定済みです',
          },
        },
        { status: 400 }
      )
    }

    console.error('Failed to confirm daily result:', error)
    return formatInternalError('日次確定に失敗しました')
  }
}
