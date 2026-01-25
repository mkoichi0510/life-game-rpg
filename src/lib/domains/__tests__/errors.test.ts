import { describe, expect, it } from 'vitest'
import {
  DomainError,
  AlreadyConfirmedError,
  FutureDateError,
  SkillNodeNotFoundError,
  PlayerStateNotFoundError,
  AlreadyUnlockedError,
  InsufficientSpError,
  PrerequisiteNotMetError,
  isDomainError,
} from '../errors'

describe('DomainError', () => {
  it('should create error with message and code', () => {
    const error = new DomainError('Test message', 'TEST_CODE')

    expect(error.message).toBe('Test message')
    expect(error.code).toBe('TEST_CODE')
    expect(error.name).toBe('DomainError')
    expect(error instanceof Error).toBe(true)
  })
})

describe('AlreadyConfirmedError', () => {
  it('should create error without dayKey', () => {
    const error = new AlreadyConfirmedError()

    expect(error.message).toBe('Already confirmed')
    expect(error.code).toBe('ALREADY_CONFIRMED')
    expect(error.name).toBe('AlreadyConfirmedError')
    expect(error instanceof DomainError).toBe(true)
  })

  it('should create error with dayKey', () => {
    const error = new AlreadyConfirmedError('2026-01-24')

    expect(error.message).toBe('Day 2026-01-24 is already confirmed')
    expect(error.code).toBe('ALREADY_CONFIRMED')
    expect(error.name).toBe('AlreadyConfirmedError')
  })
})

describe('FutureDateError', () => {
  it('should create error with dayKey', () => {
    const error = new FutureDateError('2030-01-01')

    expect(error.message).toBe('Cannot confirm future date: 2030-01-01')
    expect(error.code).toBe('FUTURE_DATE')
    expect(error.name).toBe('FutureDateError')
    expect(error instanceof DomainError).toBe(true)
  })
})

describe('isDomainError', () => {
  it('should return true for DomainError', () => {
    const error = new DomainError('Test', 'TEST')
    expect(isDomainError(error)).toBe(true)
  })

  it('should return true for AlreadyConfirmedError', () => {
    const error = new AlreadyConfirmedError()
    expect(isDomainError(error)).toBe(true)
  })

  it('should return true for FutureDateError', () => {
    const error = new FutureDateError('2030-01-01')
    expect(isDomainError(error)).toBe(true)
  })

  it('should return true for SkillNodeNotFoundError', () => {
    const error = new SkillNodeNotFoundError('node-1')
    expect(isDomainError(error)).toBe(true)
  })

  it('should return true for PlayerStateNotFoundError', () => {
    const error = new PlayerStateNotFoundError('cat-1')
    expect(isDomainError(error)).toBe(true)
  })

  it('should return true for AlreadyUnlockedError', () => {
    const error = new AlreadyUnlockedError('node-1')
    expect(isDomainError(error)).toBe(true)
  })

  it('should return true for InsufficientSpError', () => {
    const error = new InsufficientSpError(5, 2, 'node-1')
    expect(isDomainError(error)).toBe(true)
  })

  it('should return true for PrerequisiteNotMetError', () => {
    const error = new PrerequisiteNotMetError('node-2', 'node-1')
    expect(isDomainError(error)).toBe(true)
  })

  it('should return false for regular Error', () => {
    const error = new Error('Test')
    expect(isDomainError(error)).toBe(false)
  })

  it('should return false for non-error objects', () => {
    expect(isDomainError('string')).toBe(false)
    expect(isDomainError(null)).toBe(false)
    expect(isDomainError(undefined)).toBe(false)
    expect(isDomainError({ code: 'TEST' })).toBe(false)
  })
})
