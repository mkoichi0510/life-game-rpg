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

export function formatNotFoundError(resource: string, id: string) {
  return NextResponse.json(
    {
      error: {
        code: 'NOT_FOUND',
        message: `指定された${resource}が見つかりません`,
        details: { resource, id },
      },
    },
    { status: 404 }
  )
}

export function formatInternalError(message: string) {
  return NextResponse.json(
    {
      error: {
        code: 'INTERNAL_ERROR',
        message,
      },
    },
    { status: 500 }
  )
}
