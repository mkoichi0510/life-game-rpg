import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, POST } from '../route'
import { NextRequest } from 'next/server'

// Prisma クライアントをモック
vi.mock('@/lib/prisma', () => ({
  prisma: {
    category: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
  },
}))

import { prisma } from '@/lib/prisma'

const createGetRequest = (url = 'http://localhost:3000/api/categories'): NextRequest => {
  return new NextRequest(url, { method: 'GET' })
}

describe('GET /api/categories', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return all categories ordered by id', async () => {
    const mockCategories = [
      {
        id: 'cat-1',
        name: 'カテゴリ1',
        visible: true,
        order: 1,
        rankWindowDays: 7,
        xpPerPlay: 10,
        xpPerSp: 20,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'cat-2',
        name: 'カテゴリ2',
        visible: true,
        order: 2,
        rankWindowDays: 7,
        xpPerPlay: 10,
        xpPerSp: 20,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    vi.mocked(prisma.category.findMany).mockResolvedValue(mockCategories)

    const request = createGetRequest()
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.categories).toHaveLength(2)
    expect(data.categories[0].id).toBe('cat-1')
    expect(data.categories[1].id).toBe('cat-2')
    expect(prisma.category.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
      orderBy: { id: 'asc' },
    })
  })

  it('should return empty array when no categories exist', async () => {
    vi.mocked(prisma.category.findMany).mockResolvedValue([])

    const request = createGetRequest()
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.categories).toHaveLength(0)
  })

  it('should filter by visible=true when query param is set', async () => {
    const mockCategories = [
      {
        id: 'cat-1',
        name: 'カテゴリ1',
        visible: true,
        order: 1,
        rankWindowDays: 7,
        xpPerPlay: 10,
        xpPerSp: 20,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    vi.mocked(prisma.category.findMany).mockResolvedValue(mockCategories)

    const request = createGetRequest('http://localhost:3000/api/categories?visible=true')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.categories).toHaveLength(1)
    expect(prisma.category.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-1', visible: true },
      orderBy: { id: 'asc' },
    })
  })

  it('should return all categories when visible param is not true', async () => {
    const mockCategories = [
      {
        id: 'cat-1',
        name: 'カテゴリ1',
        visible: true,
        order: 1,
        rankWindowDays: 7,
        xpPerPlay: 10,
        xpPerSp: 20,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'cat-2',
        name: 'カテゴリ2',
        visible: false,
        order: 2,
        rankWindowDays: 7,
        xpPerPlay: 10,
        xpPerSp: 20,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    vi.mocked(prisma.category.findMany).mockResolvedValue(mockCategories)

    const request = createGetRequest('http://localhost:3000/api/categories?visible=false')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.categories).toHaveLength(2)
    expect(prisma.category.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
      orderBy: { id: 'asc' },
    })
  })

  it('should return 500 on database error', async () => {
    vi.mocked(prisma.category.findMany).mockRejectedValue(new Error('DB Error'))

    const request = createGetRequest()
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error.code).toBe('INTERNAL_ERROR')
  })
})

describe('POST /api/categories', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const createRequest = (body: object): NextRequest => {
    return new NextRequest('http://localhost:3000/api/categories', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    })
  }

  it('should create a category with valid data', async () => {
    const mockCategory = {
      id: 'new-cat',
      name: '新しいカテゴリ',
      visible: true,
      order: 0,
      rankWindowDays: 7,
      xpPerPlay: 10,
      xpPerSp: 20,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    vi.mocked(prisma.category.create).mockResolvedValue(mockCategory)

    const request = createRequest({ name: '新しいカテゴリ' })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.category.name).toBe('新しいカテゴリ')
  })

  it('should create a category with custom options', async () => {
    const mockCategory = {
      id: 'custom-cat',
      name: 'カスタムカテゴリ',
      visible: false,
      order: 5,
      rankWindowDays: 14,
      xpPerPlay: 15,
      xpPerSp: 30,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    vi.mocked(prisma.category.create).mockResolvedValue(mockCategory)

    const request = createRequest({
      name: 'カスタムカテゴリ',
      visible: false,
      order: 5,
      rankWindowDays: 14,
      xpPerPlay: 15,
      xpPerSp: 30,
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(prisma.category.create).toHaveBeenCalledWith({
      data: {
        userId: 'user-1',
        name: 'カスタムカテゴリ',
        visible: false,
        order: 5,
        rankWindowDays: 14,
        xpPerPlay: 15,
        xpPerSp: 30,
      },
    })
  })

  it('should return 400 when name is missing', async () => {
    const request = createRequest({})
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error.code).toBe('VALIDATION_ERROR')
    expect(data.error.details.field).toBe('name')
  })

  it('should return 400 when name is empty', async () => {
    const request = createRequest({ name: '' })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error.code).toBe('VALIDATION_ERROR')
    expect(data.error.details.field).toBe('name')
  })

  it('should return 400 when name is too long', async () => {
    const longName = 'a'.repeat(51)
    const request = createRequest({ name: longName })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error.code).toBe('VALIDATION_ERROR')
    expect(data.error.details.field).toBe('name')
    expect(data.error.details.reason).toContain('50文字')
  })

  it('should return 400 when order is not an integer', async () => {
    const request = createRequest({ name: 'test', order: 1.5 })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error.code).toBe('VALIDATION_ERROR')
    expect(data.error.details.field).toBe('order')
  })

  it('should return 400 when xpPerPlay is less than 1', async () => {
    const request = createRequest({ name: 'test', xpPerPlay: 0 })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error.code).toBe('VALIDATION_ERROR')
    expect(data.error.details.field).toBe('xpPerPlay')
  })

  it('should return 400 when xpPerSp is less than 1', async () => {
    const request = createRequest({ name: 'test', xpPerSp: 0 })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error.code).toBe('VALIDATION_ERROR')
    expect(data.error.details.field).toBe('xpPerSp')
  })

  it('should return 400 when rankWindowDays is less than 1', async () => {
    const request = createRequest({ name: 'test', rankWindowDays: 0 })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error.code).toBe('VALIDATION_ERROR')
    expect(data.error.details.field).toBe('rankWindowDays')
  })

  it('should trim whitespace from name', async () => {
    const mockCategory = {
      id: 'trimmed-cat',
      name: 'トリムされた名前',
      visible: true,
      order: 0,
      rankWindowDays: 7,
      xpPerPlay: 10,
      xpPerSp: 20,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    vi.mocked(prisma.category.create).mockResolvedValue(mockCategory)

    const request = createRequest({ name: '  トリムされた名前  ' })
    const response = await POST(request)

    expect(response.status).toBe(201)
    expect(prisma.category.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        name: 'トリムされた名前',
      }),
    })
  })

  it('should return 500 on database error', async () => {
    vi.mocked(prisma.category.create).mockRejectedValue(new Error('DB Error'))

    const request = createRequest({ name: 'test' })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error.code).toBe('INTERNAL_ERROR')
  })
})
