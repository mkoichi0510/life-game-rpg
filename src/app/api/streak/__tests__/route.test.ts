import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GET } from '../route'
import { auth } from '@/auth'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    dailyCategoryResult: {
      findMany: vi.fn(),
    },
  },
}))

vi.mock('@/lib/date', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/date')>()
  return {
    ...actual,
    getTodayKey: vi.fn(() => '2026-03-20'),
    getPreviousDayKey: actual.getPreviousDayKey,
    getRecentDayKeys: vi.fn(() => {
      const keys: string[] = []
      for (let i = 0; i < 365; i++) {
        const d = new Date('2026-03-20')
        d.setDate(d.getDate() - i)
        keys.push(d.toISOString().slice(0, 10))
      }
      return keys
    }),
  }
})

import { prisma } from '@/lib/prisma'

describe('GET /api/streak', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 401 when not authenticated', async () => {
    vi.mocked(auth).mockResolvedValueOnce(null)
    const response = await GET()
    expect(response.status).toBe(401)
    const data = await response.json()
    expect(data.error.code).toBe('UNAUTHORIZED')
  })

  it('should return streak and playedToday=true when played today', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(prisma.dailyCategoryResult.findMany).mockResolvedValue([
      { dayKey: '2026-03-20' },
      { dayKey: '2026-03-19' },
      { dayKey: '2026-03-18' },
    ] as any)

    const response = await GET()
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.streak).toBe(3)
    expect(data.playedToday).toBe(true)
  })

  it('should return streak and playedToday=false when only played yesterday (grace period)', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(prisma.dailyCategoryResult.findMany).mockResolvedValue([
      { dayKey: '2026-03-19' },
      { dayKey: '2026-03-18' },
    ] as any)

    const response = await GET()
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.streak).toBe(2)
    expect(data.playedToday).toBe(false)
  })

  it('should return streak=0 and playedToday=false when no records', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(prisma.dailyCategoryResult.findMany).mockResolvedValue([] as any)

    const response = await GET()
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.streak).toBe(0)
    expect(data.playedToday).toBe(false)
  })
})
