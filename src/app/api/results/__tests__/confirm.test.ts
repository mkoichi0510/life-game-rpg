import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from '../[dayKey]/confirm/route'

vi.mock('@/lib/domains/result', () => ({
  confirmDay: vi.fn(),
}))

import { confirmDay } from '@/lib/domains/result'

const createPostRequest = (dayKey: string) =>
  new NextRequest(`http://localhost:3000/api/results/${dayKey}/confirm`, {
    method: 'POST',
  })

describe('POST /api/results/:dayKey/confirm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 400 when dayKey is missing', async () => {
    const request = createPostRequest('')
    const response = await POST(request, {
      params: Promise.resolve({}),
    })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error.code).toBe('VALIDATION_ERROR')
    expect(data.error.details.field).toBe('dayKey')
  })

  it('should confirm daily result', async () => {
    vi.mocked(confirmDay).mockResolvedValue({
      dayKey: '2026-01-24',
    })

    const request = createPostRequest('2026-01-24')
    const response = await POST(request, {
      params: Promise.resolve({ dayKey: '2026-01-24' }),
    })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.ok).toBe(true)
    expect(confirmDay).toHaveBeenCalledWith('2026-01-24')
  })

  it('should return 400 when already confirmed', async () => {
    const error = new Error('Already confirmed')
    ;(error as Error & { code: string }).code = 'ALREADY_CONFIRMED'
    vi.mocked(confirmDay).mockRejectedValue(error)

    const request = createPostRequest('2026-01-24')
    const response = await POST(request, {
      params: Promise.resolve({ dayKey: '2026-01-24' }),
    })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error.code).toBe('INVALID_OPERATION')
  })
})
