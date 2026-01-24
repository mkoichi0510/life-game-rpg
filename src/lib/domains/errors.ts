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

export function isDomainError(error: unknown): error is DomainError {
  return error instanceof DomainError
}
