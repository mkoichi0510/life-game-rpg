import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GET } from '../trees/route'
import { GET as GET_DETAIL } from '../trees/[id]/route'
import { NextRequest } from 'next/server'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    category: {
      findUnique: vi.fn(),
    },
    skillTree: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}))

import { prisma } from '@/lib/prisma'

function createRequest(url: string): NextRequest {
  return new NextRequest(new URL(url, 'http://localhost'))
}

describe('GET /api/skills/trees', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return VALIDATION_ERROR when categoryId is missing', async () => {
    const request = createRequest('/api/skills/trees')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error.code).toBe('VALIDATION_ERROR')
    expect(data.error.details.field).toBe('categoryId')
  })

  it('should return NOT_FOUND when category does not exist', async () => {
    vi.mocked(prisma.category.findUnique).mockResolvedValue(null)

    const request = createRequest('/api/skills/trees?categoryId=non-existent')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error.code).toBe('NOT_FOUND')
    expect(data.error.details.resource).toBe('カテゴリ')
  })

  it('should return trees ordered by order then id', async () => {
    const mockCategory = { id: 'cat-1', name: '健康' }
    const mockTrees = [
      {
        id: 'tree-1',
        categoryId: 'cat-1',
        name: '筋トレ',
        visible: true,
        order: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'tree-2',
        categoryId: 'cat-1',
        name: 'ランニング',
        visible: true,
        order: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    vi.mocked(prisma.category.findUnique).mockResolvedValue(mockCategory as any)
    vi.mocked(prisma.skillTree.findMany).mockResolvedValue(mockTrees)

    const request = createRequest('/api/skills/trees?categoryId=cat-1')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.trees).toHaveLength(2)
    expect(data.trees[0].name).toBe('筋トレ')
    expect(data.trees[1].name).toBe('ランニング')
    expect(prisma.skillTree.findMany).toHaveBeenCalledWith({
      where: { categoryId: 'cat-1' },
      orderBy: [{ order: 'asc' }, { id: 'asc' }],
      select: {
        id: true,
        categoryId: true,
        name: true,
        visible: true,
        order: true,
        createdAt: true,
        updatedAt: true,
      },
    })
  })

  it('should return empty array when no trees exist', async () => {
    const mockCategory = { id: 'cat-1', name: '健康' }

    vi.mocked(prisma.category.findUnique).mockResolvedValue(mockCategory as any)
    vi.mocked(prisma.skillTree.findMany).mockResolvedValue([])

    const request = createRequest('/api/skills/trees?categoryId=cat-1')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.trees).toEqual([])
  })

  it('should return 500 on database error', async () => {
    vi.mocked(prisma.category.findUnique).mockRejectedValue(
      new Error('DB Error')
    )

    const request = createRequest('/api/skills/trees?categoryId=cat-1')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error.code).toBe('INTERNAL_ERROR')
  })
})

describe('GET /api/skills/trees/:id', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return NOT_FOUND when tree does not exist', async () => {
    vi.mocked(prisma.skillTree.findUnique).mockResolvedValue(null)

    const request = createRequest('/api/skills/trees/non-existent')
    const response = await GET_DETAIL(request, {
      params: Promise.resolve({ id: 'non-existent' }),
    })
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error.code).toBe('NOT_FOUND')
    expect(data.error.details.resource).toBe('スキルツリー')
  })

  it('should return tree with nodes and unlock status', async () => {
    const mockTree = {
      id: 'tree-1',
      categoryId: 'cat-1',
      name: '筋トレ',
      visible: true,
      order: 0,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      skillNodes: [
        {
          id: 'node-1',
          treeId: 'tree-1',
          order: 0,
          title: 'ビギナー',
          costSp: 1,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          unlockedNodes: [
            { id: 'unlock-1', unlockedAt: new Date('2024-01-15') },
          ],
        },
        {
          id: 'node-2',
          treeId: 'tree-1',
          order: 1,
          title: 'アマチュア',
          costSp: 2,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          unlockedNodes: [],
        },
      ],
    }

    vi.mocked(prisma.skillTree.findUnique).mockResolvedValue(mockTree as any)

    const request = createRequest('/api/skills/trees/tree-1')
    const response = await GET_DETAIL(request, {
      params: Promise.resolve({ id: 'tree-1' }),
    })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.tree.id).toBe('tree-1')
    expect(data.tree.name).toBe('筋トレ')
    expect(data.tree.nodes).toHaveLength(2)

    // First node is unlocked
    expect(data.tree.nodes[0].isUnlocked).toBe(true)
    expect(data.tree.nodes[0].unlockedAt).not.toBeNull()

    // Second node is not unlocked
    expect(data.tree.nodes[1].isUnlocked).toBe(false)
    expect(data.tree.nodes[1].unlockedAt).toBeNull()
  })

  it('should return 500 on database error', async () => {
    vi.mocked(prisma.skillTree.findUnique).mockRejectedValue(
      new Error('DB Error')
    )

    const request = createRequest('/api/skills/trees/tree-1')
    const response = await GET_DETAIL(request, {
      params: Promise.resolve({ id: 'tree-1' }),
    })
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error.code).toBe('INTERNAL_ERROR')
  })
})
