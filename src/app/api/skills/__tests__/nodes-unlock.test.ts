import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import {
  AlreadyUnlockedError,
  InsufficientSpError,
  PrerequisiteNotMetError,
  SkillNodeNotFoundError,
  PlayerStateNotFoundError,
  unlockNode,
} from '@/lib/domains'
import { POST } from '../nodes/[id]/unlock/route'

vi.mock('@/lib/domains', async () => {
  const actual = await vi.importActual<typeof import('@/lib/domains')>(
    '@/lib/domains'
  )
  return {
    ...actual,
    unlockNode: vi.fn(),
  }
})

function createRequest(url: string): NextRequest {
  return new NextRequest(new URL(url, 'http://localhost'))
}

describe('POST /api/skills/nodes/:id/unlock', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return VALIDATION_ERROR when id is missing', async () => {
    const request = createRequest('/api/skills/nodes//unlock')
    const response = await POST(request, { params: Promise.resolve({ id: '' }) })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error.code).toBe('VALIDATION_ERROR')
    expect(data.error.details.field).toBe('id')
  })

  it('should return unlockedNode when success', async () => {
    vi.mocked(unlockNode).mockResolvedValue({
      unlockedNode: {
        id: 'unlock-1',
        nodeId: 'node-1',
        unlockedAt: new Date('2026-01-20'),
      },
      costSp: 3,
      categoryId: 'cat-1',
      treeId: 'tree-1',
    })

    const request = createRequest('/api/skills/nodes/node-1/unlock')
    const response = await POST(request, {
      params: Promise.resolve({ id: 'node-1' }),
    })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.unlockedNode.nodeId).toBe('node-1')
    expect(vi.mocked(unlockNode)).toHaveBeenCalledWith('node-1')
  })

  it('should return NOT_FOUND when node does not exist', async () => {
    vi.mocked(unlockNode).mockRejectedValue(new SkillNodeNotFoundError('node-x'))

    const request = createRequest('/api/skills/nodes/node-x/unlock')
    const response = await POST(request, {
      params: Promise.resolve({ id: 'node-x' }),
    })
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error.code).toBe('NOT_FOUND')
  })

  it('should return NOT_FOUND when player state does not exist', async () => {
    vi.mocked(unlockNode).mockRejectedValue(
      new PlayerStateNotFoundError('cat-x')
    )

    const request = createRequest('/api/skills/nodes/node-1/unlock')
    const response = await POST(request, {
      params: Promise.resolve({ id: 'node-1' }),
    })
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error.code).toBe('NOT_FOUND')
  })

  it('should return ALREADY_UNLOCKED when already unlocked', async () => {
    vi.mocked(unlockNode).mockRejectedValue(new AlreadyUnlockedError('node-1'))

    const request = createRequest('/api/skills/nodes/node-1/unlock')
    const response = await POST(request, {
      params: Promise.resolve({ id: 'node-1' }),
    })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error.code).toBe('ALREADY_UNLOCKED')
  })

  it('should return INSUFFICIENT_SP when sp is insufficient', async () => {
    vi.mocked(unlockNode).mockRejectedValue(
      new InsufficientSpError(5, 2, 'node-1')
    )

    const request = createRequest('/api/skills/nodes/node-1/unlock')
    const response = await POST(request, {
      params: Promise.resolve({ id: 'node-1' }),
    })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error.code).toBe('INSUFFICIENT_SP')
  })

  it('should return PREREQUISITE_NOT_MET when prerequisite not met', async () => {
    vi.mocked(unlockNode).mockRejectedValue(
      new PrerequisiteNotMetError('node-2', 'node-1')
    )

    const request = createRequest('/api/skills/nodes/node-2/unlock')
    const response = await POST(request, {
      params: Promise.resolve({ id: 'node-2' }),
    })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error.code).toBe('PREREQUISITE_NOT_MET')
  })

  it('should return 500 on unexpected error', async () => {
    vi.mocked(unlockNode).mockRejectedValue(new Error('DB Error'))

    const request = createRequest('/api/skills/nodes/node-1/unlock')
    const response = await POST(request, {
      params: Promise.resolve({ id: 'node-1' }),
    })
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error.code).toBe('INTERNAL_ERROR')
  })
})
