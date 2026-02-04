import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PATCH } from '../route'
import { NextRequest } from 'next/server'

// Prisma クライアントをモック
vi.mock('@/lib/prisma', () => ({
  prisma: {
    category: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}))

import { prisma } from '@/lib/prisma'

const createRequest = (body: object): NextRequest => {
  return new NextRequest('http://localhost:3000/api/categories/test-id', {
    method: 'PATCH',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

const createParams = (id: string) => Promise.resolve({ id })

describe('PATCH /api/categories/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const mockCategory = {
    id: 'cltest12345678901234567',
    name: 'テストカテゴリ',
    visible: true,
    order: 1,
    rankWindowDays: 7,
    xpPerPlay: 10,
    xpPerSp: 20,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  it('should update visible from true to false', async () => {
    vi.mocked(prisma.category.findUnique).mockResolvedValue(mockCategory)
    vi.mocked(prisma.category.update).mockResolvedValue({
      ...mockCategory,
      visible: false,
    })

    const request = createRequest({ visible: false })
    const response = await PATCH(request, {
      params: createParams('cltest12345678901234567'),
    })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.category.visible).toBe(false)
    expect(prisma.category.update).toHaveBeenCalledWith({
      where: { id: 'cltest12345678901234567' },
      data: { visible: false },
    })
  })

  it('should update visible from false to true', async () => {
    const hiddenCategory = { ...mockCategory, visible: false }
    vi.mocked(prisma.category.findUnique).mockResolvedValue(hiddenCategory)
    vi.mocked(prisma.category.update).mockResolvedValue({
      ...hiddenCategory,
      visible: true,
    })

    const request = createRequest({ visible: true })
    const response = await PATCH(request, {
      params: createParams('cltest12345678901234567'),
    })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.category.visible).toBe(true)
    expect(prisma.category.update).toHaveBeenCalledWith({
      where: { id: 'cltest12345678901234567' },
      data: { visible: true },
    })
  })

  it('should return 404 when category does not exist', async () => {
    vi.mocked(prisma.category.findUnique).mockResolvedValue(null)

    const request = createRequest({ visible: false })
    const response = await PATCH(request, {
      params: createParams('cltest12345678901234567'),
    })
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error.message).toBe('カテゴリが見つかりません')
  })

  it('should return 400 when id is empty', async () => {
    const request = createRequest({ visible: false })
    const response = await PATCH(request, {
      params: createParams(''),
    })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error.code).toBe('VALIDATION_ERROR')
    expect(data.error.details.field).toBe('id')
  })

  it('should return 400 when visible is not boolean', async () => {
    vi.mocked(prisma.category.findUnique).mockResolvedValue(mockCategory)

    const request = new NextRequest(
      'http://localhost:3000/api/categories/cltest12345678901234567',
      {
        method: 'PATCH',
        body: JSON.stringify({ visible: 'invalid' }),
        headers: { 'Content-Type': 'application/json' },
      }
    )
    const response = await PATCH(request, {
      params: createParams('cltest12345678901234567'),
    })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error.code).toBe('VALIDATION_ERROR')
  })

  it('should return 400 when request body is invalid JSON', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/categories/cltest12345678901234567',
      {
        method: 'PATCH',
        body: 'invalid json',
        headers: { 'Content-Type': 'application/json' },
      }
    )
    const response = await PATCH(request, {
      params: createParams('cltest12345678901234567'),
    })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error.message).toBe('リクエストボディが不正です')
  })
})
