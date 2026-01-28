import { ZodError } from 'zod'
import { NextResponse } from 'next/server'

type ErrorDetails = Record<string, unknown> | undefined

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

export function formatInvalidOperationError(
  message: string,
  details?: ErrorDetails
) {
  return NextResponse.json(
    {
      error: {
        code: 'INVALID_OPERATION',
        message,
        ...(details ? { details } : {}),
      },
    },
    { status: 400 }
  )
}

export function formatBadRequestError(message: string, details?: ErrorDetails) {
  return NextResponse.json(
    {
      error: {
        code: 'BAD_REQUEST',
        message,
        ...(details ? { details } : {}),
      },
    },
    { status: 400 }
  )
}

export function formatConflictError(message: string, details?: ErrorDetails) {
  return NextResponse.json(
    {
      error: {
        code: 'CONFLICT',
        message,
        ...(details ? { details } : {}),
      },
    },
    { status: 409 }
  )
}

export function formatAlreadyUnlockedError(nodeId: string) {
  return NextResponse.json(
    {
      error: {
        code: 'ALREADY_UNLOCKED',
        message: '既に解放済みです',
        details: { nodeId },
      },
    },
    { status: 400 }
  )
}

export function formatInsufficientSpError(
  required: number,
  available: number,
  nodeId: string
) {
  return NextResponse.json(
    {
      error: {
        code: 'INSUFFICIENT_SP',
        message: 'SPが不足しています',
        details: { required, available, nodeId },
      },
    },
    { status: 400 }
  )
}

export function formatPrerequisiteNotMetError(
  nodeId: string,
  prerequisiteNodeId?: string
) {
  return NextResponse.json(
    {
      error: {
        code: 'PREREQUISITE_NOT_MET',
        message: '前提条件が未達です',
        details: { nodeId, prerequisiteNodeId },
      },
    },
    { status: 400 }
  )
}
