import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GET } from '../states/route'
import { auth } from '@/auth'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    playerCategoryState: {
      findMany: vi.fn(),
    },
  },
}))

import { prisma } from '@/lib/prisma'

describe('GET /api/player/states', () => {
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

  it('should return player states ordered by category order then id', async () => {
    const mockStates = [
      {
        id: 'state-1',
        categoryId: 'cat-1',
        xpTotal: 30,
        spUnspent: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        category: { id: 'cat-1', name: '健康', order: 1 },
      },
      {
        id: 'state-2',
        categoryId: 'cat-2',
        xpTotal: 20,
        spUnspent: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        category: { id: 'cat-2', name: '資格', order: 2 },
      },
    ]

    vi.mocked(prisma.playerCategoryState.findMany).mockResolvedValue(mockStates)

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.playerStates).toHaveLength(2)
    expect(prisma.playerCategoryState.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
      orderBy: [{ category: { order: 'asc' } }, { categoryId: 'asc' }],
      select: {
        id: true,
        categoryId: true,
        xpTotal: true,
        spUnspent: true,
        createdAt: true,
        updatedAt: true,
        category: {
          select: {
            id: true,
            name: true,
            order: true,
          },
        },
      },
    })
  })

  it('should return empty array when no states exist', async () => {
    vi.mocked(prisma.playerCategoryState.findMany).mockResolvedValue([])

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.playerStates).toEqual([])
  })

  it('should return 500 on database error', async () => {
    vi.mocked(prisma.playerCategoryState.findMany).mockRejectedValue(
      new Error('DB Error')
    )

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error.code).toBe('INTERNAL_ERROR')
  })
})
