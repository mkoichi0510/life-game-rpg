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
    skillNode: {
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

  it('should return spend logs without categoryId', async () => {
    vi.mocked(prisma.spendLog.findMany).mockResolvedValue([])

    const request = createGetRequest()
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.logs).toHaveLength(0)
    expect(data.nextCursor).toBeNull()
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
        at: new Date('2024-01-15T10:00:00.000Z'),
        categoryId: 'cat-1',
        type: 'unlock_node',
        costSp: 3,
        refId: 'node-2',
        dayKey: null,
        createdAt: new Date('2024-01-15T10:00:00.000Z'),
      },
    ]

    vi.mocked(prisma.category.findUnique).mockResolvedValue({ id: 'cat-1' })
    vi.mocked(prisma.spendLog.findMany).mockResolvedValue(mockLogs)
    vi.mocked(prisma.skillNode.findMany).mockResolvedValue([
      {
        id: 'node-2',
        title: '速読術',
        costSp: 3,
        treeId: 'tree-1',
        order: 2,
      },
    ])

    const request = createGetRequest('cat-1')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.logs).toHaveLength(1)
    expect(data.logs[0]).toEqual({
      id: 'log-2',
      categoryId: 'cat-1',
      at: '2024-01-15T10:00:00.000Z',
      costSp: 3,
      skillNode: {
        id: 'node-2',
        title: '速読術',
        costSp: 3,
        treeId: 'tree-1',
        order: 2,
      },
      createdAt: '2024-01-15T10:00:00.000Z',
    })
    expect(prisma.spendLog.findMany).toHaveBeenCalledWith({
      where: { categoryId: 'cat-1' },
      orderBy: [{ at: 'desc' }, { id: 'desc' }],
      take: 21,
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

  it('should return validation error for invalid limit', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/player/spend-logs?limit=0'
    )
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error.code).toBe('VALIDATION_ERROR')
    expect(data.error.details.field).toBe('limit')
  })

  it('should return validation error for invalid cursor', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/player/spend-logs?cursor=invalid'
    )
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error.code).toBe('VALIDATION_ERROR')
    expect(data.error.details.field).toBe('cursor')
  })

  it('should return nextCursor when more results exist', async () => {
    const firstLog = {
      id: 'log-2',
      at: new Date('2024-01-15T10:00:00.000Z'),
      categoryId: 'cat-1',
      type: 'unlock_node',
      costSp: 3,
      refId: 'node-2',
      dayKey: null,
      createdAt: new Date('2024-01-15T10:00:00.000Z'),
    }
    const secondLog = {
      id: 'log-1',
      at: new Date('2024-01-15T09:00:00.000Z'),
      categoryId: 'cat-1',
      type: 'unlock_node',
      costSp: 2,
      refId: 'node-1',
      dayKey: null,
      createdAt: new Date('2024-01-15T09:00:00.000Z'),
    }

    vi.mocked(prisma.category.findUnique).mockResolvedValue({ id: 'cat-1' })
    vi.mocked(prisma.spendLog.findMany).mockResolvedValue([firstLog, secondLog])
    vi.mocked(prisma.skillNode.findMany).mockResolvedValue([
      {
        id: 'node-2',
        title: '速読術',
        costSp: 3,
        treeId: 'tree-1',
        order: 2,
      },
    ])

    const request = new NextRequest(
      'http://localhost:3000/api/player/spend-logs?categoryId=cat-1&limit=1'
    )
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.logs).toHaveLength(1)
    expect(data.nextCursor).toBe('2024-01-15T10:00:00.000Z__log-2')
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

  it('should return correct results when using cursor for pagination', async () => {
    // Simulate second page request with cursor
    const thirdLog = {
      id: 'log-1',
      at: new Date('2024-01-15T08:00:00.000Z'),
      categoryId: 'cat-1',
      type: 'unlock_node',
      costSp: 1,
      refId: 'node-1',
      dayKey: null,
      createdAt: new Date('2024-01-15T08:00:00.000Z'),
    }

    vi.mocked(prisma.category.findUnique).mockResolvedValue({ id: 'cat-1' })
    vi.mocked(prisma.spendLog.findMany).mockResolvedValue([thirdLog])
    vi.mocked(prisma.skillNode.findMany).mockResolvedValue([
      {
        id: 'node-1',
        title: '集中力',
        costSp: 1,
        treeId: 'tree-1',
        order: 1,
      },
    ])

    // Use cursor from previous page (log-2's at and id)
    const cursor = '2024-01-15T10:00:00.000Z__log-2'
    const request = new NextRequest(
      `http://localhost:3000/api/player/spend-logs?categoryId=cat-1&limit=2&cursor=${encodeURIComponent(cursor)}`
    )
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.logs).toHaveLength(1)
    expect(data.logs[0].id).toBe('log-1')
    expect(data.logs[0].at).toBe('2024-01-15T08:00:00.000Z')
    expect(data.logs[0].costSp).toBe(1)
    expect(data.nextCursor).toBeNull()

    // Verify cursor was used in the query
    expect(prisma.spendLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          categoryId: 'cat-1',
          OR: [
            { at: { lt: new Date('2024-01-15T10:00:00.000Z') } },
            {
              AND: [
                { at: new Date('2024-01-15T10:00:00.000Z') },
                { id: { lt: 'log-2' } },
              ],
            },
          ],
        }),
      })
    )
  })
})
