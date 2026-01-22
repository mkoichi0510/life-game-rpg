import { ZodError } from 'zod'
import { NextResponse } from 'next/server'

export function formatZodError(error: ZodError) {
  const firstError = error.errors[0]
  return NextResponse.json(
    {
      error: {
        code: 'VALIDATION_ERROR',
        message: '入力値が不正です',
        details: {
          field: firstError.path.join('.'),
          reason: firstError.message,
        },
      },
    },
    { status: 400 }
  )
}
