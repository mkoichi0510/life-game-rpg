import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GET } from '../route'
import { NextRequest } from 'next/server'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    category: {
      findMany: vi.fn(),
    },
    dailyCategoryResult: {
      findMany: vi.fn(),
    },
    seasonalTitle: {
      findMany: vi.fn(),
    },
    unlockedNode: {
      findMany: vi.fn(),
    },
  },
}))

vi.mock('@/lib/date', () => ({
  getRecentDayKeys: vi.fn(),
  parseDayKey: vi.fn(),
  getNextDayKey: vi.fn(),
  formatDayKey: vi.fn(),
}))

import { prisma } from '@/lib/prisma'
import {
  formatDayKey,
  getNextDayKey,
  getRecentDayKeys,
  parseDayKey,
} from '@/lib/date'

function createRequest(url: string): NextRequest {
  return new NextRequest(new URL(url, 'http://localhost'))
}

describe('GET /api/highlights', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return highlights with rank changes and week summary', async () => {
    const categories = [
      { id: 'cat-1', name: '健康', order: 1, rankWindowDays: 7 },
      { id: 'cat-2', name: '学習', order: 2, rankWindowDays: 7 },
    ]

    vi.mocked(prisma.category.findMany).mockResolvedValue(categories as any)

    vi.mocked(getRecentDayKeys).mockImplementation((days) => {
      if (days === 7) {
        return [
          '2026-02-02',
          '2026-02-01',
          '2026-01-31',
          '2026-01-30',
          '2026-01-29',
          '2026-01-28',
          '2026-01-27',
        ]
      }
      if (days === 14) {
        return [
          '2026-02-02',
          '2026-02-01',
          '2026-01-31',
          '2026-01-30',
          '2026-01-29',
          '2026-01-28',
          '2026-01-27',
          '2026-01-26',
          '2026-01-25',
          '2026-01-24',
          '2026-01-23',
          '2026-01-22',
          '2026-01-21',
          '2026-01-20',
        ]
      }
      return []
    })

    vi.mocked(getNextDayKey).mockReturnValue('2026-02-03')
    vi.mocked(parseDayKey).mockImplementation((dayKey) => {
      return new Date(`${dayKey}T00:00:00+09:00`)
    })
    vi.mocked(formatDayKey).mockImplementation((date) => {
      return new Date(date).toISOString().slice(0, 10)
    })

    vi.mocked(prisma.dailyCategoryResult.findMany).mockImplementation(
      async (args) => {
        const select = (args as any).select ?? {}
        if (select.categoryId) {
          return [
            { categoryId: 'cat-1', dayKey: '2026-02-02', spEarned: 5 },
            { categoryId: 'cat-1', dayKey: '2026-02-01', spEarned: 4 },
            { categoryId: 'cat-1', dayKey: '2026-01-26', spEarned: 2 },
            { categoryId: 'cat-1', dayKey: '2026-01-25', spEarned: 1 },
          ] as any
        }
        return [
          { xpEarned: 120, spEarned: 6 },
          { xpEarned: 80, spEarned: 4 },
        ] as any
      }
    )

    vi.mocked(prisma.seasonalTitle.findMany).mockResolvedValue([
      {
        categoryId: 'cat-1',
        label: 'アクティブ',
        minSpEarned: 8,
      },
      {
        categoryId: 'cat-1',
        label: 'ルーキー',
        minSpEarned: 0,
      },
    ] as any)

    vi.mocked(prisma.unlockedNode.findMany).mockResolvedValue([
      {
        unlockedAt: new Date('2026-01-28T12:00:00+09:00'),
        node: {
          id: 'node-1',
          title: '腕立て伏せ',
          tree: {
            category: { id: 'cat-1', name: '健康', visible: true },
          },
        },
      },
    ] as any)

    const request = createRequest('/api/highlights')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.weekSummary).toEqual({ totalSp: 10, totalXp: 200 })
    expect(data.unlockedNodes).toEqual([
      {
        id: 'node-1',
        name: '腕立て伏せ',
        unlockedAt: '2026-01-28',
        categoryName: '健康',
      },
    ])
    expect(data.rankUps).toEqual([
      {
        categoryId: 'cat-1',
        categoryName: '健康',
        fromRank: 'ルーキー',
        toRank: 'アクティブ',
      },
    ])
  })

  it('should return empty rankUps when rank does not change', async () => {
    vi.mocked(prisma.category.findMany).mockResolvedValue([
      { id: 'cat-1', name: '健康', order: 1, rankWindowDays: 7 },
    ] as any)

    vi.mocked(getRecentDayKeys).mockImplementation((days) => {
      if (days === 7) {
        return [
          '2026-02-02',
          '2026-02-01',
          '2026-01-31',
          '2026-01-30',
          '2026-01-29',
          '2026-01-28',
          '2026-01-27',
        ]
      }
      if (days === 14) {
        return [
          '2026-02-02',
          '2026-02-01',
          '2026-01-31',
          '2026-01-30',
          '2026-01-29',
          '2026-01-28',
          '2026-01-27',
          '2026-01-26',
          '2026-01-25',
          '2026-01-24',
          '2026-01-23',
          '2026-01-22',
          '2026-01-21',
          '2026-01-20',
        ]
      }
      return []
    })

    vi.mocked(getNextDayKey).mockReturnValue('2026-02-03')
    vi.mocked(parseDayKey).mockImplementation((dayKey) => {
      return new Date(`${dayKey}T00:00:00+09:00`)
    })
    vi.mocked(formatDayKey).mockImplementation((date) => {
      return new Date(date).toISOString().slice(0, 10)
    })

    vi.mocked(prisma.dailyCategoryResult.findMany).mockImplementation(
      async (args) => {
        const select = (args as any).select ?? {}
        if (select.categoryId) {
          return [
            { categoryId: 'cat-1', dayKey: '2026-02-02', spEarned: 2 },
            { categoryId: 'cat-1', dayKey: '2026-01-26', spEarned: 2 },
          ] as any
        }
        return [] as any
      }
    )

    vi.mocked(prisma.seasonalTitle.findMany).mockResolvedValue([
      {
        categoryId: 'cat-1',
        label: 'ルーキー',
        minSpEarned: 0,
      },
    ] as any)

    vi.mocked(prisma.unlockedNode.findMany).mockResolvedValue([] as any)

    const request = createRequest('/api/highlights')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.rankUps).toEqual([])
  })

  it('should return 500 on database error', async () => {
    vi.mocked(prisma.category.findMany).mockRejectedValue(
      new Error('DB Error')
    )

    const request = createRequest('/api/highlights')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error.code).toBe('INTERNAL_ERROR')
  })
})
