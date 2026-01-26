import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { GET, POST } from '../route'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    action: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
    category: {
      findUnique: vi.fn(),
    },
  },
}))

import { prisma } from '@/lib/prisma'

const createGetRequest = (url: string): NextRequest => {
  return new NextRequest(url, { method: 'GET' })
}

describe('GET /api/actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 400 when categoryId is missing', async () => {
    const request = createGetRequest('http://localhost:3000/api/actions')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error.code).toBe('VALIDATION_ERROR')
    expect(data.error.details.field).toBe('categoryId')
  })

  it('should return actions ordered by order then id', async () => {
    const mockActions = [
      {
        id: 'action-1',
        categoryId: 'cat-1',
        label: 'アクション1',
        visible: true,
        order: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'action-2',
        categoryId: 'cat-1',
        label: 'アクション2',
        visible: true,
        order: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    vi.mocked(prisma.category.findUnique).mockResolvedValue({ id: 'cat-1' })
    vi.mocked(prisma.action.findMany).mockResolvedValue(mockActions)

    const request = createGetRequest(
      'http://localhost:3000/api/actions?categoryId=cat-1'
    )
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.actions).toHaveLength(2)
    expect(prisma.action.findMany).toHaveBeenCalledWith({
      where: {
        categoryId: 'cat-1',
      },
      orderBy: [{ order: 'asc' }, { id: 'asc' }],
    })
  })

  it('should filter by visible=true when query param is set', async () => {
    const mockActions = [
      {
        id: 'action-1',
        categoryId: 'cat-1',
        label: 'アクション1',
        visible: true,
        order: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    vi.mocked(prisma.category.findUnique).mockResolvedValue({ id: 'cat-1' })
    vi.mocked(prisma.action.findMany).mockResolvedValue(mockActions)

    const request = createGetRequest(
      'http://localhost:3000/api/actions?categoryId=cat-1&visible=true'
    )
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.actions).toHaveLength(1)
    expect(prisma.action.findMany).toHaveBeenCalledWith({
      where: {
        categoryId: 'cat-1',
        visible: true,
      },
      orderBy: [{ order: 'asc' }, { id: 'asc' }],
    })
  })

  it('should return 404 when category does not exist', async () => {
    vi.mocked(prisma.category.findUnique).mockResolvedValue(null)

    const request = createGetRequest(
      'http://localhost:3000/api/actions?categoryId=non-existent'
    )
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error.code).toBe('NOT_FOUND')
    expect(data.error.details.id).toBe('non-existent')
  })

  it('should trim whitespace from categoryId', async () => {
    vi.mocked(prisma.category.findUnique).mockResolvedValue({ id: 'cat-1' })
    vi.mocked(prisma.action.findMany).mockResolvedValue([])

    const request = createGetRequest(
      'http://localhost:3000/api/actions?categoryId=%20cat-1%20'
    )
    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(prisma.category.findUnique).toHaveBeenCalledWith({
      where: { id: 'cat-1' },
      select: { id: true },
    })
  })

  it('should return empty array when category exists but has no actions', async () => {
    vi.mocked(prisma.category.findUnique).mockResolvedValue({ id: 'cat-1' })
    vi.mocked(prisma.action.findMany).mockResolvedValue([])

    const request = createGetRequest(
      'http://localhost:3000/api/actions?categoryId=cat-1'
    )
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.actions).toEqual([])
  })

  it('should return 500 on database error', async () => {
    vi.mocked(prisma.category.findUnique).mockResolvedValue({ id: 'cat-1' })
    vi.mocked(prisma.action.findMany).mockRejectedValue(new Error('DB Error'))

    const request = createGetRequest(
      'http://localhost:3000/api/actions?categoryId=cat-1'
    )
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error.code).toBe('INTERNAL_ERROR')
  })
})

describe('POST /api/actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const createRequest = (body: object): NextRequest => {
    return new NextRequest('http://localhost:3000/api/actions', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    })
  }

  it('should create an action with valid data', async () => {
    const mockAction = {
      id: 'action-1',
      categoryId: 'cat-1',
      label: '新しいアクション',
      visible: true,
      order: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    vi.mocked(prisma.category.findUnique).mockResolvedValue({ id: 'cat-1' })
    vi.mocked(prisma.action.create).mockResolvedValue(mockAction)

    const request = createRequest({ categoryId: 'cat-1', label: '新しいアクション' })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.action.label).toBe('新しいアクション')
  })

  it('should create an action with custom options', async () => {
    const mockAction = {
      id: 'action-2',
      categoryId: 'cat-1',
      label: 'カスタムアクション',
      visible: false,
      order: 5,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    vi.mocked(prisma.category.findUnique).mockResolvedValue({ id: 'cat-1' })
    vi.mocked(prisma.action.create).mockResolvedValue(mockAction)

    const request = createRequest({
      categoryId: 'cat-1',
      label: 'カスタムアクション',
      visible: false,
      order: 5,
    })
    const response = await POST(request)
    await response.json()

    expect(response.status).toBe(201)
    expect(prisma.action.create).toHaveBeenCalledWith({
      data: {
        categoryId: 'cat-1',
        label: 'カスタムアクション',
        visible: false,
        order: 5,
      },
    })
  })

  it('should return 400 when categoryId is missing', async () => {
    const request = createRequest({ label: 'test' })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error.code).toBe('VALIDATION_ERROR')
    expect(data.error.details.field).toBe('categoryId')
  })

  it('should return 400 when label is missing', async () => {
    const request = createRequest({ categoryId: 'cat-1' })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error.code).toBe('VALIDATION_ERROR')
    expect(data.error.details.field).toBe('label')
  })

  it('should return 400 when label is empty', async () => {
    const request = createRequest({ categoryId: 'cat-1', label: '' })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error.code).toBe('VALIDATION_ERROR')
    expect(data.error.details.field).toBe('label')
  })

  it('should return 400 when label is too long', async () => {
    const longLabel = 'a'.repeat(51)
    const request = createRequest({ categoryId: 'cat-1', label: longLabel })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error.code).toBe('VALIDATION_ERROR')
    expect(data.error.details.field).toBe('label')
    expect(data.error.details.reason).toContain('50文字')
  })

  it('should return 400 when order is not an integer', async () => {
    const request = createRequest({ categoryId: 'cat-1', label: 'test', order: 1.5 })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error.code).toBe('VALIDATION_ERROR')
    expect(data.error.details.field).toBe('order')
  })

  it('should trim whitespace from label', async () => {
    const mockAction = {
      id: 'action-trim',
      categoryId: 'cat-1',
      label: 'トリムされたアクション',
      visible: true,
      order: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    vi.mocked(prisma.category.findUnique).mockResolvedValue({ id: 'cat-1' })
    vi.mocked(prisma.action.create).mockResolvedValue(mockAction)

    const request = createRequest({
      categoryId: 'cat-1',
      label: '  トリムされたアクション  ',
    })
    const response = await POST(request)

    expect(response.status).toBe(201)
    expect(prisma.action.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        label: 'トリムされたアクション',
      }),
    })
  })

  it('should return 404 when category does not exist', async () => {
    vi.mocked(prisma.category.findUnique).mockResolvedValue(null)

    const request = createRequest({ categoryId: 'missing', label: 'test' })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error.code).toBe('NOT_FOUND')
  })

  it('should return 500 on database error', async () => {
    vi.mocked(prisma.category.findUnique).mockResolvedValue({ id: 'cat-1' })
    vi.mocked(prisma.action.create).mockRejectedValue(new Error('DB Error'))

    const request = createRequest({ categoryId: 'cat-1', label: 'test' })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error.code).toBe('INTERNAL_ERROR')
  })
})
