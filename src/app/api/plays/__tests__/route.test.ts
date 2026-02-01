import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { GET, POST } from '../route'
import { DELETE } from '../[id]/route'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    playLog: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    action: {
      findUnique: vi.fn(),
    },
    dailyResult: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
    dailyCategoryResult: {
      findUnique: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}))

import { prisma } from '@/lib/prisma'

const createGetRequest = (url: string): NextRequest => {
  return new NextRequest(url, { method: 'GET' })
}

const createPostRequest = (body: object): NextRequest => {
  return new NextRequest('http://localhost:3000/api/plays', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('GET /api/plays', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 400 when dayKey is missing', async () => {
    const request = createGetRequest('http://localhost:3000/api/plays')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error.code).toBe('VALIDATION_ERROR')
    expect(data.error.details.field).toBe('dayKey')
  })

  it('should return play logs ordered by time then id', async () => {
    const mockPlayLogs = [
      {
        id: 'play-1',
        dayKey: '2026-01-24',
        at: new Date('2026-01-24T01:00:00Z'),
        actionId: 'action-1',
        note: null,
        createdAt: new Date(),
        action: {
          id: 'action-1',
          label: 'テスト',
          categoryId: 'cat-1',
          unit: null,
          category: { id: 'cat-1', name: 'カテゴリ' },
        },
      },
    ]

    vi.mocked(prisma.playLog.findMany).mockResolvedValue(mockPlayLogs)

    const request = createGetRequest(
      'http://localhost:3000/api/plays?dayKey=2026-01-24'
    )
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.playLogs).toHaveLength(1)
    expect(prisma.playLog.findMany).toHaveBeenCalledWith({
      where: { dayKey: '2026-01-24' },
      orderBy: [{ at: 'asc' }, { id: 'asc' }],
      include: expect.any(Object),
    })
  })

  it('should filter play logs by categoryId', async () => {
    const mockPlayLogs = [
      {
        id: 'play-1',
        dayKey: '2026-01-24',
        at: new Date('2026-01-24T01:00:00Z'),
        actionId: 'action-1',
        note: null,
        createdAt: new Date(),
        action: {
          id: 'action-1',
          label: 'テスト',
          categoryId: 'cat-1',
          unit: null,
          category: { id: 'cat-1', name: 'カテゴリ' },
        },
      },
    ]

    vi.mocked(prisma.playLog.findMany).mockResolvedValue(mockPlayLogs)

    const request = createGetRequest(
      'http://localhost:3000/api/plays?dayKey=2026-01-24&categoryId=cat-1'
    )
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.playLogs).toHaveLength(1)
    expect(prisma.playLog.findMany).toHaveBeenCalledWith({
      where: {
        dayKey: '2026-01-24',
        action: { categoryId: 'cat-1' },
      },
      orderBy: [{ at: 'asc' }, { id: 'asc' }],
      include: expect.any(Object),
    })
  })
})

describe('POST /api/plays', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 400 when actionId is missing', async () => {
    const request = createPostRequest({ note: 'test' })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error.code).toBe('VALIDATION_ERROR')
    expect(data.error.details.field).toBe('actionId')
  })

  it('should return 404 when action does not exist', async () => {
    vi.mocked(prisma.action.findUnique).mockResolvedValue(null)

    const request = createPostRequest({ actionId: 'missing' })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error.code).toBe('NOT_FOUND')
  })

  it('should return 400 when quantity is missing for unit action', async () => {
    const mockAction = {
      id: 'action-1',
      categoryId: 'cat-1',
      unit: '回',
      category: {
        id: 'cat-1',
        xpPerPlay: 10,
        xpPerSp: 20,
      },
    }

    vi.mocked(prisma.action.findUnique).mockResolvedValue(mockAction)
    vi.mocked(prisma.dailyResult.findUnique).mockResolvedValue({
      status: 'draft',
    })

    const request = createPostRequest({ actionId: 'action-1' })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error.code).toBe('VALIDATION_ERROR')
    expect(data.error.details.field).toBe('quantity')
  })

  it('should return 400 when quantity is provided for action without unit', async () => {
    const mockAction = {
      id: 'action-1',
      categoryId: 'cat-1',
      unit: null,
      category: {
        id: 'cat-1',
        xpPerPlay: 10,
        xpPerSp: 20,
      },
    }

    vi.mocked(prisma.action.findUnique).mockResolvedValue(mockAction)
    vi.mocked(prisma.dailyResult.findUnique).mockResolvedValue({
      status: 'draft',
    })

    const request = createPostRequest({ actionId: 'action-1', quantity: 3 })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error.code).toBe('VALIDATION_ERROR')
    expect(data.error.details.field).toBe('quantity')
  })

  it('should return 400 when quantity is zero', async () => {
    const mockAction = {
      id: 'action-1',
      categoryId: 'cat-1',
      unit: '回',
      category: {
        id: 'cat-1',
        xpPerPlay: 10,
        xpPerSp: 20,
      },
    }

    vi.mocked(prisma.action.findUnique).mockResolvedValue(mockAction)
    vi.mocked(prisma.dailyResult.findUnique).mockResolvedValue({
      status: 'draft',
    })

    const request = createPostRequest({ actionId: 'action-1', quantity: 0 })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error.code).toBe('VALIDATION_ERROR')
    expect(data.error.details.field).toBe('quantity')
    expect(data.error.details.reason).toContain('1')
  })

  it('should store quantity when provided', async () => {
    const mockAction = {
      id: 'action-1',
      categoryId: 'cat-1',
      unit: '回',
      category: {
        id: 'cat-1',
        xpPerPlay: 10,
        xpPerSp: 20,
      },
    }

    const tx = {
      dailyResult: { upsert: vi.fn() },
      playLog: { create: vi.fn() },
      dailyCategoryResult: {
        findUnique: vi.fn(),
        update: vi.fn(),
        create: vi.fn(),
      },
    }

    vi.mocked(prisma.action.findUnique).mockResolvedValue(mockAction)
    vi.mocked(prisma.dailyResult.findUnique).mockResolvedValue({
      status: 'draft',
    })
    vi.mocked(prisma.$transaction).mockImplementation(async (cb) => cb(tx))

    tx.playLog.create.mockResolvedValue({
      id: 'play-1',
      dayKey: '2026-01-24',
      at: new Date(),
      actionId: 'action-1',
      note: null,
      quantity: 5,
      createdAt: new Date(),
      action: {
        id: 'action-1',
        label: 'テスト',
        categoryId: 'cat-1',
        unit: '回',
        category: { id: 'cat-1', name: 'カテゴリ' },
      },
    })
    tx.dailyCategoryResult.findUnique.mockResolvedValue({ id: 'dcr-1', playCount: 0 })

    const request = createPostRequest({ actionId: 'action-1', quantity: 5 })
    const response = await POST(request)

    expect(response.status).toBe(201)
    expect(tx.playLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ quantity: 5 }),
      })
    )
  })

  it('should register play for next day when today is confirmed', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-24T12:00:00Z'))

    const mockAction = {
      id: 'action-1',
      categoryId: 'cat-1',
      unit: null,
      category: {
        id: 'cat-1',
        xpPerPlay: 10,
        xpPerSp: 20,
      },
    }

    const tx = {
      dailyResult: { upsert: vi.fn() },
      playLog: { create: vi.fn() },
      dailyCategoryResult: {
        findUnique: vi.fn(),
        update: vi.fn(),
        create: vi.fn(),
      },
    }

    vi.mocked(prisma.action.findUnique).mockResolvedValue(mockAction)
    vi.mocked(prisma.dailyResult.findUnique).mockResolvedValue({
      status: 'confirmed',
    })
    vi.mocked(prisma.$transaction).mockImplementation(async (cb) => cb(tx))

    tx.playLog.create.mockResolvedValue({
      id: 'play-1',
      dayKey: '2026-01-25',
      at: new Date(),
      actionId: 'action-1',
      note: null,
      createdAt: new Date(),
      action: {
        id: 'action-1',
        label: 'テスト',
        categoryId: 'cat-1',
        unit: null,
        category: { id: 'cat-1', name: 'カテゴリ' },
      },
    })
    tx.dailyCategoryResult.findUnique.mockResolvedValue({ id: 'dcr-1', playCount: 2 })

    const request = createPostRequest({ actionId: 'action-1' })
    const response = await POST(request)

    expect(response.status).toBe(201)
    expect(tx.playLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ dayKey: '2026-01-25' }),
      })
    )
    expect(tx.dailyCategoryResult.update).toHaveBeenCalledWith({
      where: { id: 'dcr-1' },
      data: {
        playCount: 3,
        xpEarned: 30,
        spEarned: 1,
        playLogs: { connect: { id: 'play-1' } },
      },
    })

    vi.useRealTimers()
  })
})

describe('DELETE /api/plays/:id', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 400 when id is missing', async () => {
    const response = await DELETE(new Request('http://localhost:3000'), {
      params: {},
    })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error.code).toBe('VALIDATION_ERROR')
    expect(data.error.details.field).toBe('id')
  })

  it('should block delete when day is confirmed', async () => {
    vi.mocked(prisma.playLog.findUnique).mockResolvedValue({
      id: 'play-1',
      dayKey: '2026-01-24',
      action: {
        categoryId: 'cat-1',
        category: { xpPerPlay: 10, xpPerSp: 20 },
      },
    })
    vi.mocked(prisma.dailyResult.findUnique).mockResolvedValue({
      status: 'confirmed',
    })

    const response = await DELETE(new Request('http://localhost:3000'), {
      params: { id: 'play-1' },
    })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error.code).toBe('INVALID_OPERATION')
    expect(prisma.$transaction).not.toHaveBeenCalled()
  })

  it('should delete play log and update daily category result', async () => {
    const tx = {
      dailyCategoryResult: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      playLog: {
        delete: vi.fn(),
      },
    }

    vi.mocked(prisma.playLog.findUnique).mockResolvedValue({
      id: 'play-1',
      dayKey: '2026-01-24',
      action: {
        categoryId: 'cat-1',
        category: { xpPerPlay: 10, xpPerSp: 20 },
      },
    })
    vi.mocked(prisma.dailyResult.findUnique).mockResolvedValue({
      status: 'draft',
    })
    vi.mocked(prisma.$transaction).mockImplementation(async (cb) => cb(tx))
    tx.dailyCategoryResult.findUnique.mockResolvedValue({
      id: 'dcr-1',
      playCount: 2,
    })

    const response = await DELETE(new Request('http://localhost:3000'), {
      params: { id: 'play-1' },
    })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.ok).toBe(true)
    expect(tx.dailyCategoryResult.update).toHaveBeenCalledWith({
      where: { id: 'dcr-1' },
      data: {
        playCount: 1,
        xpEarned: 10,
        spEarned: 0,
      },
    })
    expect(tx.playLog.delete).toHaveBeenCalledWith({ where: { id: 'play-1' } })
  })
})
