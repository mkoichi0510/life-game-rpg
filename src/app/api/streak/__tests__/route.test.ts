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

// getTodayKey のみモック。getRecentDayKeys・getPreviousDayKey は実装をそのまま使用
vi.mock('@/lib/date', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/date')>()
  return {
    ...actual,
    getTodayKey: vi.fn(() => '2026-03-20'),
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

  it('should return streak=3 and playedToday=true when played today and 2 days before', async () => {
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

  it('should return streak=2 and playedToday=false when only played yesterday (grace period)', async () => {
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

  it('should return streak=0 when streak is broken (gap between yesterday and day before)', async () => {
    // 今日未プレイ、昨日(03-19)も未プレイ、一昨日(03-18)のみあり → grace period起点の昨日から遡るが昨日もなし → streak=0
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(prisma.dailyCategoryResult.findMany).mockResolvedValue([
      { dayKey: '2026-03-18' },
    ] as any)

    const response = await GET()
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.streak).toBe(0)
    expect(data.playedToday).toBe(false)
  })

  it('should return streak=1 and playedToday=true when only played today', async () => {
    // 今日プレイ済み・昨日未プレイ → streak=1
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(prisma.dailyCategoryResult.findMany).mockResolvedValue([
      { dayKey: '2026-03-20' },
    ] as any)

    const response = await GET()
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.streak).toBe(1)
    expect(data.playedToday).toBe(true)
  })

  it('should return 500 when database throws an error', async () => {
    vi.mocked(prisma.dailyCategoryResult.findMany).mockRejectedValue(
      new Error('DB connection error')
    )

    const response = await GET()
    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data.error).toBeDefined()
  })
})
