import {
  ApiHttpError,
  ApiNetworkError,
  ApiTimeoutError,
  isApiErrorPayload,
} from './errors'

const DEFAULT_TIMEOUT_MS = 8000

function parseJsonSafely(text: string): unknown {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

export async function fetchJson<T>(
  url: string,
  init?: RequestInit,
  options?: { timeoutMs?: number }
): Promise<T> {
  const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, {
      cache: 'no-store',
      ...init,
      signal: controller.signal,
    })

    const text = await response.text()
    const parsed = text ? parseJsonSafely(text) : null

    if (!response.ok) {
      if (isApiErrorPayload(parsed)) {
        throw new ApiHttpError(
          parsed.error.message,
          response.status,
          parsed.error.code,
          parsed.error.details
        )
      }
      const message = text || `Failed to fetch ${url}`
      throw new ApiHttpError(message, response.status)
    }

    if (!text) {
      throw new ApiHttpError(`Empty response from ${url}`, response.status)
    }

    return (parsed ?? JSON.parse(text)) as T
  } catch (error) {
    if (
      (typeof DOMException !== 'undefined' &&
        error instanceof DOMException &&
        error.name === 'AbortError') ||
      (error &&
        typeof error === 'object' &&
        'name' in error &&
        (error as { name?: string }).name === 'AbortError')
    ) {
      throw new ApiTimeoutError(timeoutMs)
    }
    if (error instanceof ApiHttpError) {
      throw error
    }
    if (error instanceof TypeError) {
      throw new ApiNetworkError()
    }
    throw error
  } finally {
    clearTimeout(timeoutId)
  }
}
