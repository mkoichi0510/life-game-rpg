import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AlreadyConfirmedError, FutureDateError } from '../errors'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    $transaction: vi.fn(),
  },
}))

vi.mock('@/lib/date', () => ({
  getTodayKey: vi.fn(() => '2026-01-24'),
  getRecentDayKeys: vi.fn((days: number) => {
    const keys: string[] = []
    for (let i = 0; i < days; i++) {
      const date = new Date(2026, 0, 24 - i)
      keys.push(date.toISOString().split('T')[0])
    }
    return keys
  }),
}))

import { prisma } from '@/lib/prisma'
import { confirmDay, autoConfirmRecentDays } from '../result'

describe('confirmDay', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should throw FutureDateError for future date', async () => {
    await expect(confirmDay('2030-01-01')).rejects.toThrow(FutureDateError)
    await expect(confirmDay('2030-01-01')).rejects.toMatchObject({
      code: 'FUTURE_DATE',
      message: 'Cannot confirm future date: 2030-01-01',
    })
  })

  it('should throw FutureDateError for tomorrow', async () => {
    await expect(confirmDay('2026-01-25')).rejects.toThrow(FutureDateError)
  })

  it('should allow today', async () => {
    vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
      const tx = {
        dailyResult: {
          findUnique: vi.fn().mockResolvedValue({
            dayKey: '2026-01-24',
            status: 'draft',
            categoryResults: [],
          }),
          update: vi.fn().mockResolvedValue({
            dayKey: '2026-01-24',
            status: 'confirmed',
          }),
        },
      }
      return callback(tx as unknown as Parameters<typeof callback>[0])
    })

    await expect(confirmDay('2026-01-24')).resolves.toBeDefined()
  })

  it('should allow past date', async () => {
    vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
      const tx = {
        dailyResult: {
          findUnique: vi.fn().mockResolvedValue({
            dayKey: '2026-01-23',
            status: 'draft',
            categoryResults: [],
          }),
          update: vi.fn().mockResolvedValue({
            dayKey: '2026-01-23',
            status: 'confirmed',
          }),
        },
      }
      return callback(tx as unknown as Parameters<typeof callback>[0])
    })

    await expect(confirmDay('2026-01-23')).resolves.toBeDefined()
  })

  it('should throw AlreadyConfirmedError when already confirmed', async () => {
    vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
      const tx = {
        dailyResult: {
          findUnique: vi.fn().mockResolvedValue({
            dayKey: '2026-01-23',
            status: 'confirmed',
            categoryResults: [],
          }),
        },
      }
      return callback(tx as unknown as Parameters<typeof callback>[0])
    })

    await expect(confirmDay('2026-01-23')).rejects.toThrow(AlreadyConfirmedError)
    await expect(confirmDay('2026-01-23')).rejects.toMatchObject({
      code: 'ALREADY_CONFIRMED',
    })
  })

  it('should return existing result when allowAlreadyConfirmed is true', async () => {
    const existingResult = {
      dayKey: '2026-01-23',
      status: 'confirmed',
      categoryResults: [],
    }

    vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
      const tx = {
        dailyResult: {
          findUnique: vi.fn().mockResolvedValue(existingResult),
        },
      }
      return callback(tx as unknown as Parameters<typeof callback>[0])
    })

    const result = await confirmDay('2026-01-23', { allowAlreadyConfirmed: true })
    expect(result).toEqual(existingResult)
  })
})

describe('autoConfirmRecentDays', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should exclude today from confirmation', async () => {
    const confirmedDays: string[] = []

    vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
      const tx = {
        dailyResult: {
          findUnique: vi.fn().mockImplementation(({ where }) => {
            confirmedDays.push(where.dayKey)
            return Promise.resolve({
              dayKey: where.dayKey,
              status: 'draft',
              categoryResults: [],
            })
          }),
          update: vi.fn().mockResolvedValue({}),
        },
      }
      return callback(tx as unknown as Parameters<typeof callback>[0])
    })

    await autoConfirmRecentDays(3)

    expect(confirmedDays).not.toContain('2026-01-24')
    expect(confirmedDays).toContain('2026-01-23')
    expect(confirmedDays).toContain('2026-01-22')
  })

  it('should process days in parallel', async () => {
    const callOrder: string[] = []
    let resolveFirst: () => void
    const firstPromise = new Promise<void>((resolve) => {
      resolveFirst = resolve
    })

    vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
      const tx = {
        dailyResult: {
          findUnique: vi.fn().mockImplementation(async ({ where }) => {
            callOrder.push(`start:${where.dayKey}`)
            if (where.dayKey === '2026-01-23') {
              await firstPromise
            }
            callOrder.push(`end:${where.dayKey}`)
            return {
              dayKey: where.dayKey,
              status: 'draft',
              categoryResults: [],
            }
          }),
          update: vi.fn().mockResolvedValue({}),
        },
      }
      return callback(tx as unknown as Parameters<typeof callback>[0])
    })

    const autoConfirmPromise = autoConfirmRecentDays(3)

    // Wait for all to start
    await new Promise((resolve) => setTimeout(resolve, 10))

    // All should have started before resolving the first
    expect(callOrder.filter((c) => c.startsWith('start:')).length).toBeGreaterThan(1)

    resolveFirst!()
    await autoConfirmPromise

    // Verify parallel execution: second day should start before first ends
    const startFirst = callOrder.indexOf('start:2026-01-23')
    const startSecond = callOrder.indexOf('start:2026-01-22')
    const endFirst = callOrder.indexOf('end:2026-01-23')

    expect(startSecond).toBeLessThan(endFirst)
    expect(startFirst).toBeGreaterThanOrEqual(0)
  })
})
