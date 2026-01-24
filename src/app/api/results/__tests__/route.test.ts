import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { GET } from '../[dayKey]/route'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    dailyResult: {
      findUnique: vi.fn(),
    },
  },
}))

vi.mock('@/lib/domains', () => ({
  confirmDay: vi.fn(),
}))

vi.mock('@/lib/date', () => ({
  getTodayKey: vi.fn(() => '2026-01-25'),
}))

import { prisma } from '@/lib/prisma'

const createGetRequest = (dayKey: string) =>
  new NextRequest(`http://localhost:3000/api/results/${dayKey}`)

describe('GET /api/results/:dayKey', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 400 when dayKey is missing', async () => {
    const request = createGetRequest('')
    const response = await GET(request, {
      params: Promise.resolve({}),
    })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error.code).toBe('VALIDATION_ERROR')
    expect(data.error.details.field).toBe('dayKey')
  })

  it('should return 400 for invalid date format', async () => {
    const request = createGetRequest('invalid-date')
    const response = await GET(request, {
      params: Promise.resolve({ dayKey: 'invalid-date' }),
    })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error.code).toBe('VALIDATION_ERROR')
    expect(data.error.details.field).toBe('dayKey')
  })

  it('should return 400 for non-existent date (Feb 30)', async () => {
    const request = createGetRequest('2026-02-30')
    const response = await GET(request, {
      params: Promise.resolve({ dayKey: '2026-02-30' }),
    })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error.code).toBe('VALIDATION_ERROR')
    expect(data.error.details.field).toBe('dayKey')
    expect(data.error.details.reason).toBe('有効な日付を指定してください')
  })

  it('should return 400 for invalid month (month 13)', async () => {
    const request = createGetRequest('2026-13-01')
    const response = await GET(request, {
      params: Promise.resolve({ dayKey: '2026-13-01' }),
    })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error.code).toBe('VALIDATION_ERROR')
    expect(data.error.details.field).toBe('dayKey')
  })

  it('should return empty result when DailyResult does not exist', async () => {
    vi.mocked(prisma.dailyResult.findUnique).mockResolvedValue(null)

    const request = createGetRequest('2026-01-24')
    const response = await GET(request, {
      params: Promise.resolve({ dayKey: '2026-01-24' }),
    })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.dailyResult.dayKey).toBe('2026-01-24')
    expect(data.dailyResult.status).toBe('draft')
    expect(data.categoryResults).toHaveLength(0)
  })

  it('should return daily result with category results', async () => {
    vi.mocked(prisma.dailyResult.findUnique).mockResolvedValue({
      dayKey: '2026-01-24',
      status: 'draft',
      confirmedAt: null,
      categoryResults: [
        {
          id: 'dcr-1',
          dayKey: '2026-01-24',
          categoryId: 'cat-1',
          playCount: 2,
          xpEarned: 20,
          spEarned: 1,
          category: {
            id: 'cat-1',
            name: '健康',
            order: 1,
            xpPerPlay: 10,
            xpPerSp: 20,
          },
        },
      ],
    })

    const request = createGetRequest('2026-01-24')
    const response = await GET(request, {
      params: Promise.resolve({ dayKey: '2026-01-24' }),
    })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.dailyResult.dayKey).toBe('2026-01-24')
    expect(data.categoryResults).toHaveLength(1)
    expect(data.categoryResults[0].category.name).toBe('健康')
  })
})
