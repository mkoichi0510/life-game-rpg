import { NextRequest, NextResponse } from 'next/server'
import { dayKeyParamSchema } from '@/lib/validations/result'
import {
  formatInternalError,
  formatInvalidOperationError,
  formatZodError,
} from '@/lib/validations/helpers'
import {
  confirmDay,
  AlreadyConfirmedError,
  FutureDateError,
} from '@/lib/domains'

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
    if (error instanceof AlreadyConfirmedError) {
      return formatInvalidOperationError('既に確定済みです')
    }

    if (error instanceof FutureDateError) {
      return formatInvalidOperationError('未来の日付は確定できません')
    }

    console.error('Failed to confirm daily result:', error)
    return formatInternalError('日次確定に失敗しました')
  }
}
