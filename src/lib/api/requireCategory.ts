import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { formatNotFoundError } from '@/lib/validations/helpers'
import { Prisma } from '@prisma/client'

type CategorySuccess<T> = { readonly ok: true; readonly category: T }
type CategoryFailure = { readonly ok: false; readonly response: NextResponse }
export type RequireCategoryResult<T> = CategorySuccess<T> | CategoryFailure

export function isCategorySuccess<T>(
  result: RequireCategoryResult<T>
): result is CategorySuccess<T> {
  return result.ok === true
}

export function isCategoryFailure<T>(
  result: RequireCategoryResult<T>
): result is CategoryFailure {
  return result.ok === false
}

// select未指定の場合のオーバーロード
export async function requireCategory(
  categoryId: string
): Promise<RequireCategoryResult<{ id: string }>>

// select指定ありの場合のオーバーロード
export async function requireCategory<T extends Prisma.CategorySelect>(
  categoryId: string,
  select: T
): Promise<RequireCategoryResult<Prisma.CategoryGetPayload<{ select: T }>>>

// 実装
export async function requireCategory<T extends Prisma.CategorySelect>(
  categoryId: string,
  select?: T
): Promise<RequireCategoryResult<unknown>> {
  // select未指定時はデフォルトで { id: true } を使用
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    select: select ?? { id: true },
  })

  if (!category) {
    return {
      ok: false as const,
      response: formatNotFoundError('カテゴリ', categoryId),
    }
  }

  return { ok: true as const, category }
}
