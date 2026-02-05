import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import { formatUnauthorizedError } from '@/lib/validations/helpers'

type UserSuccess = { readonly ok: true; readonly userId: string }
type UserFailure = { readonly ok: false; readonly response: NextResponse }
export type RequireUserResult = UserSuccess | UserFailure

export function isUserSuccess(
  result: RequireUserResult
): result is UserSuccess {
  return result.ok === true
}

export function isUserFailure(
  result: RequireUserResult
): result is UserFailure {
  return result.ok === false
}

export async function requireUser(): Promise<RequireUserResult> {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    return { ok: false as const, response: formatUnauthorizedError() }
  }

  return { ok: true as const, userId }
}
