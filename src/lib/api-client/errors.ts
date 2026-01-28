export type ApiErrorPayload = {
  error: {
    code: string
    message: string
    details?: Record<string, unknown>
  }
}

export class ApiClientError extends Error {
  code?: string
  status?: number
  details?: Record<string, unknown>
  constructor(message: string) {
    super(message)
    this.name = 'ApiClientError'
  }
}

export class ApiTimeoutError extends ApiClientError {
  constructor(timeoutMs: number) {
    super(`Timeout after ${timeoutMs}ms`)
    this.name = 'ApiTimeoutError'
    this.code = 'TIMEOUT'
  }
}

export class ApiNetworkError extends ApiClientError {
  constructor() {
    super('Network error')
    this.name = 'ApiNetworkError'
    this.code = 'NETWORK_ERROR'
  }
}

export class ApiHttpError extends ApiClientError {
  constructor(
    message: string,
    status: number,
    code?: string,
    details?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'ApiHttpError'
    this.status = status
    this.code = code
    this.details = details
  }
}

export function isApiErrorPayload(value: unknown): value is ApiErrorPayload {
  if (!value || typeof value !== 'object') return false
  const error = (value as ApiErrorPayload).error
  if (!error || typeof error !== 'object') return false
  return (
    typeof error.code === 'string' &&
    typeof error.message === 'string'
  )
}

export function getUserMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiTimeoutError) {
    return '通信がタイムアウトしました。時間をおいて再度お試しください。'
  }
  if (error instanceof ApiNetworkError) {
    return 'ネットワークに接続できません。通信状況を確認してください。'
  }
  if (error instanceof ApiHttpError) {
    return error.message || fallback
  }
  if (error instanceof Error) {
    return error.message || fallback
  }
  return fallback
}
