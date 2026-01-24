import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GET } from '../nodes/route'
import { NextRequest } from 'next/server'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    skillTree: {
      findUnique: vi.fn(),
    },
    skillNode: {
      findMany: vi.fn(),
    },
  },
}))

import { prisma } from '@/lib/prisma'

function createRequest(url: string): NextRequest {
  return new NextRequest(new URL(url, 'http://localhost'))
}

describe('GET /api/skills/nodes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return VALIDATION_ERROR when treeId is missing', async () => {
    const request = createRequest('/api/skills/nodes')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error.code).toBe('VALIDATION_ERROR')
    expect(data.error.details.field).toBe('treeId')
  })

  it('should return NOT_FOUND when tree does not exist', async () => {
    vi.mocked(prisma.skillTree.findUnique).mockResolvedValue(null)

    const request = createRequest('/api/skills/nodes?treeId=non-existent')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error.code).toBe('NOT_FOUND')
    expect(data.error.details.resource).toBe('スキルツリー')
  })

  it('should return nodes with unlock status ordered by order then id', async () => {
    const mockTree = { id: 'tree-1', name: '筋トレ' }
    const mockNodes = [
      {
        id: 'node-1',
        treeId: 'tree-1',
        order: 0,
        title: 'ビギナー',
        costSp: 1,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        unlockedNodes: [{ id: 'unlock-1', unlockedAt: new Date('2024-01-15') }],
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
      {
        id: 'node-3',
        treeId: 'tree-1',
        order: 2,
        title: 'プロ',
        costSp: 3,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        unlockedNodes: [],
      },
    ]

    vi.mocked(prisma.skillTree.findUnique).mockResolvedValue(mockTree as any)
    vi.mocked(prisma.skillNode.findMany).mockResolvedValue(mockNodes as any)

    const request = createRequest('/api/skills/nodes?treeId=tree-1')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.nodes).toHaveLength(3)

    // First node is unlocked
    expect(data.nodes[0].id).toBe('node-1')
    expect(data.nodes[0].title).toBe('ビギナー')
    expect(data.nodes[0].isUnlocked).toBe(true)
    expect(data.nodes[0].unlockedAt).not.toBeNull()

    // Second node is not unlocked
    expect(data.nodes[1].id).toBe('node-2')
    expect(data.nodes[1].title).toBe('アマチュア')
    expect(data.nodes[1].isUnlocked).toBe(false)
    expect(data.nodes[1].unlockedAt).toBeNull()

    // Third node is not unlocked
    expect(data.nodes[2].id).toBe('node-3')
    expect(data.nodes[2].isUnlocked).toBe(false)

    expect(prisma.skillNode.findMany).toHaveBeenCalledWith({
      where: { treeId: 'tree-1' },
      orderBy: [{ order: 'asc' }, { id: 'asc' }],
      include: {
        unlockedNodes: {
          select: {
            id: true,
            unlockedAt: true,
          },
        },
      },
    })
  })

  it('should return empty array when no nodes exist', async () => {
    const mockTree = { id: 'tree-1', name: '筋トレ' }

    vi.mocked(prisma.skillTree.findUnique).mockResolvedValue(mockTree as any)
    vi.mocked(prisma.skillNode.findMany).mockResolvedValue([])

    const request = createRequest('/api/skills/nodes?treeId=tree-1')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.nodes).toEqual([])
  })

  it('should return 500 on database error', async () => {
    vi.mocked(prisma.skillTree.findUnique).mockRejectedValue(
      new Error('DB Error')
    )

    const request = createRequest('/api/skills/nodes?treeId=tree-1')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error.code).toBe('INTERNAL_ERROR')
  })
})
