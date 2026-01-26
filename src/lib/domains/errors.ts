export class DomainError extends Error {
  readonly code: string
  constructor(message: string, code: string) {
    super(message)
    this.name = 'DomainError'
    this.code = code
  }
}

export class AlreadyConfirmedError extends DomainError {
  constructor(dayKey?: string) {
    super(
      dayKey ? `Day ${dayKey} is already confirmed` : 'Already confirmed',
      'ALREADY_CONFIRMED'
    )
    this.name = 'AlreadyConfirmedError'
  }
}

export class FutureDateError extends DomainError {
  constructor(dayKey: string) {
    super(`Cannot confirm future date: ${dayKey}`, 'FUTURE_DATE')
    this.name = 'FutureDateError'
  }
}

export class SkillNodeNotFoundError extends DomainError {
  readonly nodeId: string
  constructor(nodeId: string) {
    super(`Skill node not found: ${nodeId}`, 'SKILL_NODE_NOT_FOUND')
    this.name = 'SkillNodeNotFoundError'
    this.nodeId = nodeId
  }
}

export class PlayerStateNotFoundError extends DomainError {
  readonly categoryId: string
  constructor(categoryId: string) {
    super(`Player state not found for category: ${categoryId}`, 'PLAYER_STATE_NOT_FOUND')
    this.name = 'PlayerStateNotFoundError'
    this.categoryId = categoryId
  }
}

export class AlreadyUnlockedError extends DomainError {
  readonly nodeId: string
  constructor(nodeId: string) {
    super(`Skill node already unlocked: ${nodeId}`, 'ALREADY_UNLOCKED')
    this.name = 'AlreadyUnlockedError'
    this.nodeId = nodeId
  }
}

export class InsufficientSpError extends DomainError {
  readonly required: number
  readonly available: number
  readonly nodeId: string
  constructor(required: number, available: number, nodeId: string) {
    super(
      `Insufficient SP: need ${required}, have ${available} (nodeId: ${nodeId})`,
      'INSUFFICIENT_SP'
    )
    this.name = 'InsufficientSpError'
    this.required = required
    this.available = available
    this.nodeId = nodeId
  }
}

export class PrerequisiteNotMetError extends DomainError {
  readonly nodeId: string
  readonly prerequisiteNodeId?: string
  constructor(nodeId: string, prerequisiteNodeId?: string) {
    super(
      `Prerequisite not met for node: ${nodeId}`,
      'PREREQUISITE_NOT_MET'
    )
    this.name = 'PrerequisiteNotMetError'
    this.nodeId = nodeId
    this.prerequisiteNodeId = prerequisiteNodeId
  }
}

export function isDomainError(error: unknown): error is DomainError {
  return error instanceof DomainError
}
