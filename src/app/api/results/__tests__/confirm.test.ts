import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from '../[dayKey]/confirm/route'
import { AlreadyConfirmedError, FutureDateError } from '@/lib/domains'

vi.mock('@/lib/domains', () => ({
  confirmDay: vi.fn(),
  AlreadyConfirmedError: class AlreadyConfirmedError extends Error {
    code = 'ALREADY_CONFIRMED'
    constructor() {
      super('Already confirmed')
    }
  },
  FutureDateError: class FutureDateError extends Error {
    code = 'FUTURE_DATE'
    constructor(dayKey: string) {
      super(`Cannot confirm future date: ${dayKey}`)
    }
  },
}))

import { confirmDay } from '@/lib/domains'

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
    vi.mocked(confirmDay).mockRejectedValue(new AlreadyConfirmedError())

    const request = createPostRequest('2026-01-24')
    const response = await POST(request, {
      params: Promise.resolve({ dayKey: '2026-01-24' }),
    })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error.code).toBe('INVALID_OPERATION')
    expect(data.error.message).toBe('既に確定済みです')
  })

  it('should return 400 for future date', async () => {
    vi.mocked(confirmDay).mockRejectedValue(new FutureDateError('2030-01-01'))

    const request = createPostRequest('2030-01-01')
    const response = await POST(request, {
      params: Promise.resolve({ dayKey: '2030-01-01' }),
    })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error.code).toBe('INVALID_OPERATION')
    expect(data.error.message).toBe('未来の日付は確定できません')
  })
})
