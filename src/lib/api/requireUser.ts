import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import { formatUnauthorizedError } from '@/lib/validations/helpers'
import { prisma } from '@/lib/prisma'

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
  if (process.env.E2E_AUTH_BYPASS === '1') {
    const email = process.env.DEFAULT_USER_EMAIL
    if (email) {
      // findUnique → upsert に変更（ユーザーがなければ作成）
      const user = await prisma.user.upsert({
        where: { email },
        update: {},
        create: { email, name: 'E2E User' },
      })
      return { ok: true as const, userId: user.id }
    }
  }

  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    return { ok: false as const, response: formatUnauthorizedError() }
  }

  return { ok: true as const, userId }
}
