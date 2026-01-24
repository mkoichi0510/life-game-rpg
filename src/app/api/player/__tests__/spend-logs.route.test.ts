import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { GET } from '../spend-logs/route'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    category: {
      findUnique: vi.fn(),
    },
    spendLog: {
      findMany: vi.fn(),
    },
  },
}))

import { prisma } from '@/lib/prisma'

const createGetRequest = (categoryId?: string) =>
  new NextRequest(
    `http://localhost:3000/api/player/spend-logs${
      categoryId ? `?categoryId=${categoryId}` : ''
    }`
  )

describe('GET /api/player/spend-logs', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 400 when categoryId is missing', async () => {
    const request = createGetRequest()
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error.code).toBe('VALIDATION_ERROR')
    expect(data.error.details.field).toBe('categoryId')
  })

  it('should return 404 when category does not exist', async () => {
    vi.mocked(prisma.category.findUnique).mockResolvedValue(null)

    const request = createGetRequest('missing')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error.code).toBe('NOT_FOUND')
  })

  it('should return spend logs ordered by at then id desc', async () => {
    const mockLogs = [
      {
        id: 'log-2',
        at: new Date(),
        categoryId: 'cat-1',
        type: 'unlock_node',
        costSp: 3,
        refId: 'node-2',
        dayKey: null,
        createdAt: new Date(),
      },
    ]

    vi.mocked(prisma.category.findUnique).mockResolvedValue({ id: 'cat-1' })
    vi.mocked(prisma.spendLog.findMany).mockResolvedValue(mockLogs)

    const request = createGetRequest('cat-1')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.spendLogs).toHaveLength(1)
    expect(prisma.spendLog.findMany).toHaveBeenCalledWith({
      where: { categoryId: 'cat-1' },
      orderBy: [{ at: 'desc' }, { id: 'desc' }],
      select: {
        id: true,
        at: true,
        categoryId: true,
        type: true,
        costSp: true,
        refId: true,
        dayKey: true,
        createdAt: true,
      },
    })
  })

  it('should return 500 on database error', async () => {
    vi.mocked(prisma.category.findUnique).mockResolvedValue({ id: 'cat-1' })
    vi.mocked(prisma.spendLog.findMany).mockRejectedValue(new Error('DB Error'))

    const request = createGetRequest('cat-1')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error.code).toBe('INTERNAL_ERROR')
  })
})
