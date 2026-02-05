import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GET } from '../seasonal-titles/route'
import { GET as GET_CURRENT } from '../seasonal-titles/current/route'
import { NextRequest } from 'next/server'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    category: {
      findFirst: vi.fn(),
    },
    seasonalTitle: {
      findMany: vi.fn(),
    },
    dailyCategoryResult: {
      findMany: vi.fn(),
    },
  },
}))

vi.mock('@/lib/date', () => ({
  getRecentDayKeys: vi.fn(),
}))

import { prisma } from '@/lib/prisma'
import { getRecentDayKeys } from '@/lib/date'

function createRequest(url: string): NextRequest {
  return new NextRequest(new URL(url, 'http://localhost'))
}

describe('GET /api/skills/seasonal-titles', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return VALIDATION_ERROR when categoryId is missing', async () => {
    const request = createRequest('/api/skills/seasonal-titles')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error.code).toBe('VALIDATION_ERROR')
    expect(data.error.details.field).toBe('categoryId')
  })

  it('should return NOT_FOUND when category does not exist', async () => {
    vi.mocked(prisma.category.findFirst).mockResolvedValue(null)

    const request = createRequest(
      '/api/skills/seasonal-titles?categoryId=non-existent'
    )
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error.code).toBe('NOT_FOUND')
    expect(data.error.details.resource).toBe('カテゴリ')
  })

  it('should return titles ordered by order then id', async () => {
    const mockCategory = { id: 'cat-1', name: '健康' }
    const mockTitles = [
      {
        id: 'title-1',
        categoryId: 'cat-1',
        label: 'ブロンズ',
        minSpEarned: 1,
        order: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'title-2',
        categoryId: 'cat-1',
        label: 'シルバー',
        minSpEarned: 5,
        order: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'title-3',
        categoryId: 'cat-1',
        label: 'ゴールド',
        minSpEarned: 10,
        order: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    vi.mocked(prisma.category.findFirst).mockResolvedValue(mockCategory as any)
    vi.mocked(prisma.seasonalTitle.findMany).mockResolvedValue(mockTitles)

    const request = createRequest(
      '/api/skills/seasonal-titles?categoryId=cat-1'
    )
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.titles).toHaveLength(3)
    expect(data.titles[0].label).toBe('ブロンズ')
    expect(data.titles[1].label).toBe('シルバー')
    expect(data.titles[2].label).toBe('ゴールド')
    expect(prisma.seasonalTitle.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-1', categoryId: 'cat-1' },
      orderBy: [{ order: 'asc' }, { id: 'asc' }],
      select: {
        id: true,
        categoryId: true,
        label: true,
        minSpEarned: true,
        order: true,
        createdAt: true,
        updatedAt: true,
      },
    })
  })

  it('should return empty array when no titles exist', async () => {
    const mockCategory = { id: 'cat-1', name: '健康' }

    vi.mocked(prisma.category.findFirst).mockResolvedValue(mockCategory as any)
    vi.mocked(prisma.seasonalTitle.findMany).mockResolvedValue([])

    const request = createRequest(
      '/api/skills/seasonal-titles?categoryId=cat-1'
    )
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.titles).toEqual([])
  })

  it('should return 500 on database error', async () => {
    vi.mocked(prisma.category.findFirst).mockRejectedValue(
      new Error('DB Error')
    )

    const request = createRequest(
      '/api/skills/seasonal-titles?categoryId=cat-1'
    )
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error.code).toBe('INTERNAL_ERROR')
  })
})

describe('GET /api/skills/seasonal-titles/current', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return VALIDATION_ERROR when categoryId is missing', async () => {
    const request = createRequest('/api/skills/seasonal-titles/current')
    const response = await GET_CURRENT(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error.code).toBe('VALIDATION_ERROR')
    expect(data.error.details.field).toBe('categoryId')
  })

  it('should return NOT_FOUND when category does not exist', async () => {
    vi.mocked(prisma.category.findFirst).mockResolvedValue(null)

    const request = createRequest(
      '/api/skills/seasonal-titles/current?categoryId=non-existent'
    )
    const response = await GET_CURRENT(request)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error.code).toBe('NOT_FOUND')
    expect(data.error.details.resource).toBe('カテゴリ')
  })

  it('should return current title based on recent SP earned', async () => {
    const mockCategory = { id: 'cat-1', name: '健康', rankWindowDays: 7 }
    const silverCreatedAt = new Date('2024-01-01T00:00:00Z')
    const silverUpdatedAt = new Date('2024-01-01T00:00:00Z')
    // Ordered by minSpEarned desc as the API does
    const mockTitles = [
      {
        id: 'title-3',
        categoryId: 'cat-1',
        label: 'ゴールド',
        minSpEarned: 10,
        order: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'title-2',
        categoryId: 'cat-1',
        label: 'シルバー',
        minSpEarned: 5,
        order: 1,
        createdAt: silverCreatedAt,
        updatedAt: silverUpdatedAt,
      },
      {
        id: 'title-1',
        categoryId: 'cat-1',
        label: 'ブロンズ',
        minSpEarned: 1,
        order: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]
    const mockCategoryResults = [
      { spEarned: 3 },
      { spEarned: 2 },
      { spEarned: 2 },
    ]

    vi.mocked(prisma.category.findFirst).mockResolvedValue(mockCategory as any)
    vi.mocked(getRecentDayKeys).mockReturnValue([
      '2024-01-01',
      '2024-01-02',
      '2024-01-03',
    ])
    vi.mocked(prisma.dailyCategoryResult.findMany).mockResolvedValue(
      mockCategoryResults as any
    )
    vi.mocked(prisma.seasonalTitle.findMany).mockResolvedValue(mockTitles as any)

    const request = createRequest(
      '/api/skills/seasonal-titles/current?categoryId=cat-1'
    )
    const response = await GET_CURRENT(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.totalSpEarned).toBe(7)
    expect(data.currentTitle.label).toBe('シルバー')
    expect(data.currentTitle.createdAt).toBe(silverCreatedAt.toISOString())
    expect(data.currentTitle.updatedAt).toBe(silverUpdatedAt.toISOString())
    expect(data.rankWindowDays).toBe(7)
  })

  it('should return null when SP is below minimum title threshold', async () => {
    const mockCategory = { id: 'cat-1', name: '健康', rankWindowDays: 7 }
    const mockTitles = [
      {
        id: 'title-1',
        categoryId: 'cat-1',
        label: 'ブロンズ',
        minSpEarned: 5,
        order: 0,
      },
    ]
    const mockCategoryResults = [{ spEarned: 2 }]

    vi.mocked(prisma.category.findFirst).mockResolvedValue(mockCategory as any)
    vi.mocked(getRecentDayKeys).mockReturnValue(['2024-01-01'])
    vi.mocked(prisma.dailyCategoryResult.findMany).mockResolvedValue(
      mockCategoryResults as any
    )
    vi.mocked(prisma.seasonalTitle.findMany).mockResolvedValue(mockTitles as any)

    const request = createRequest(
      '/api/skills/seasonal-titles/current?categoryId=cat-1'
    )
    const response = await GET_CURRENT(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.totalSpEarned).toBe(2)
    expect(data.currentTitle).toBeNull()
  })

  it('should return null when no category results exist', async () => {
    const mockCategory = { id: 'cat-1', name: '健康', rankWindowDays: 7 }
    const mockTitles = [
      {
        id: 'title-1',
        categoryId: 'cat-1',
        label: 'ブロンズ',
        minSpEarned: 1,
        order: 0,
      },
    ]

    vi.mocked(prisma.category.findFirst).mockResolvedValue(mockCategory as any)
    vi.mocked(getRecentDayKeys).mockReturnValue(['2024-01-01'])
    vi.mocked(prisma.dailyCategoryResult.findMany).mockResolvedValue([])
    vi.mocked(prisma.seasonalTitle.findMany).mockResolvedValue(mockTitles as any)

    const request = createRequest(
      '/api/skills/seasonal-titles/current?categoryId=cat-1'
    )
    const response = await GET_CURRENT(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.totalSpEarned).toBe(0)
    expect(data.currentTitle).toBeNull()
  })

  it('should return 500 on database error', async () => {
    vi.mocked(prisma.category.findFirst).mockRejectedValue(
      new Error('DB Error')
    )

    const request = createRequest(
      '/api/skills/seasonal-titles/current?categoryId=cat-1'
    )
    const response = await GET_CURRENT(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error.code).toBe('INTERNAL_ERROR')
  })
})
