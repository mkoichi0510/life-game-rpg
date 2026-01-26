import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { GET } from '../states/[categoryId]/route'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    category: {
      findUnique: vi.fn(),
    },
  },
}))

import { prisma } from '@/lib/prisma'

const createGetRequest = (categoryId: string) =>
  new NextRequest(`http://localhost:3000/api/player/states/${categoryId}`)

describe('GET /api/player/states/:categoryId', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 400 when categoryId is missing', async () => {
    const request = createGetRequest('')
    const response = await GET(request, { params: Promise.resolve({}) })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error.code).toBe('VALIDATION_ERROR')
    expect(data.error.details.field).toBe('categoryId')
  })

  it('should return 404 when category does not exist', async () => {
    vi.mocked(prisma.category.findUnique).mockResolvedValue(null)

    const request = createGetRequest('missing')
    const response = await GET(request, {
      params: Promise.resolve({ categoryId: 'missing' }),
    })
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error.code).toBe('NOT_FOUND')
  })

  it('should return null playerState when no state exists', async () => {
    vi.mocked(prisma.category.findUnique).mockResolvedValue({
      id: 'cat-1',
      name: '健康',
      order: 1,
      playerState: null,
    })

    const request = createGetRequest('cat-1')
    const response = await GET(request, {
      params: Promise.resolve({ categoryId: 'cat-1' }),
    })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.category.id).toBe('cat-1')
    expect(data.playerState).toBeNull()
  })

  it('should return playerState when it exists', async () => {
    vi.mocked(prisma.category.findUnique).mockResolvedValue({
      id: 'cat-1',
      name: '健康',
      order: 1,
      playerState: {
        id: 'state-1',
        categoryId: 'cat-1',
        xpTotal: 40,
        spUnspent: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })

    const request = createGetRequest('cat-1')
    const response = await GET(request, {
      params: Promise.resolve({ categoryId: 'cat-1' }),
    })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.playerState.spUnspent).toBe(2)
  })

  it('should return 500 on database error', async () => {
    vi.mocked(prisma.category.findUnique).mockRejectedValue(
      new Error('DB Error')
    )

    const request = createGetRequest('cat-1')
    const response = await GET(request, {
      params: Promise.resolve({ categoryId: 'cat-1' }),
    })
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error.code).toBe('INTERNAL_ERROR')
  })
})
