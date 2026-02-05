import { beforeEach, describe, expect, it, vi } from 'vitest'
import { unlockNode } from '../skill'
import {
  AlreadyUnlockedError,
  InsufficientSpError,
  PlayerStateNotFoundError,
  PrerequisiteNotMetError,
  SkillNodeNotFoundError,
} from '../errors'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    $transaction: vi.fn(),
  },
}))

import { prisma } from '@/lib/prisma'

const userId = 'user-1'

describe('unlockNode', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should throw SkillNodeNotFoundError when node is missing', async () => {
    vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
      const tx = {
        skillNode: {
          findFirst: vi.fn().mockResolvedValue(null),
        },
      }
      return callback(tx as unknown as Parameters<typeof callback>[0])
    })

    await expect(unlockNode(userId, 'node-x')).rejects.toThrow(
      SkillNodeNotFoundError
    )
  })

  it('should throw AlreadyUnlockedError when node already unlocked', async () => {
    vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
      const tx = {
        skillNode: {
          findFirst: vi.fn().mockResolvedValue({
            id: 'node-1',
            treeId: 'tree-1',
            order: 1,
            costSp: 3,
            unlockedNodes: [{ id: 'unlock-1' }],
            tree: { category: { playerState: { spUnspent: 10 } } },
          }),
        },
      }
      return callback(tx as unknown as Parameters<typeof callback>[0])
    })

    await expect(unlockNode(userId, 'node-1')).rejects.toThrow(
      AlreadyUnlockedError
    )
  })

  it('should throw PlayerStateNotFoundError when player state is missing', async () => {
    vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
      const tx = {
        skillNode: {
          findFirst: vi.fn().mockResolvedValue({
            id: 'node-1',
            treeId: 'tree-1',
            order: 1,
            costSp: 3,
            unlockedNodes: [],
            tree: { categoryId: 'cat-1', category: { playerState: null } },
          }),
        },
      }
      return callback(tx as unknown as Parameters<typeof callback>[0])
    })

    await expect(unlockNode(userId, 'node-1')).rejects.toThrow(
      PlayerStateNotFoundError
    )
  })

  it('should throw InsufficientSpError when sp is insufficient', async () => {
    vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
      const tx = {
        skillNode: {
          findFirst: vi.fn().mockResolvedValue({
            id: 'node-1',
            treeId: 'tree-1',
            order: 1,
            costSp: 5,
            unlockedNodes: [],
            tree: {
              categoryId: 'cat-1',
              category: { playerState: { spUnspent: 2 } },
            },
          }),
        },
      }
      return callback(tx as unknown as Parameters<typeof callback>[0])
    })

    await expect(unlockNode(userId, 'node-1')).rejects.toThrow(
      InsufficientSpError
    )
  })

  it('should throw PrerequisiteNotMetError when previous node is not unlocked', async () => {
    vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
      const tx = {
        skillNode: {
          findFirst: vi.fn().mockResolvedValue({
            id: 'node-2',
            treeId: 'tree-1',
            order: 2,
            costSp: 3,
            unlockedNodes: [],
            tree: {
              categoryId: 'cat-1',
              category: { playerState: { spUnspent: 10 } },
            },
          }),
          findUnique: vi.fn().mockResolvedValue({
            id: 'node-1',
            treeId: 'tree-1',
            order: 1,
            unlockedNodes: [],
          }),
        },
      }
      return callback(tx as unknown as Parameters<typeof callback>[0])
    })

    await expect(unlockNode(userId, 'node-2')).rejects.toThrow(
      PrerequisiteNotMetError
    )
  })

  it('should unlock node and create spend log', async () => {
    vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
      const tx = {
        skillNode: {
          findFirst: vi.fn().mockResolvedValue({
            id: 'node-1',
            treeId: 'tree-1',
            order: 1,
            costSp: 3,
            unlockedNodes: [],
            tree: {
              categoryId: 'cat-1',
              category: { playerState: { spUnspent: 10 } },
            },
          }),
        },
        playerCategoryState: {
          update: vi.fn().mockResolvedValue({}),
        },
        unlockedNode: {
          create: vi.fn().mockResolvedValue({
            id: 'unlock-1',
            nodeId: 'node-1',
            unlockedAt: new Date('2026-01-20'),
          }),
        },
        spendLog: {
          create: vi.fn().mockResolvedValue({}),
        },
      }
      return callback(tx as unknown as Parameters<typeof callback>[0])
    })

    const result = await unlockNode(userId, 'node-1')

    expect(result.unlockedNode.nodeId).toBe('node-1')
    expect(result.categoryId).toBe('cat-1')
    expect(result.treeId).toBe('tree-1')
  })
})
