import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { formatNotFoundError } from '@/lib/validations/helpers'
import { Prisma } from '@prisma/client'

type RequireCategoryResult<T> =
  | { ok: true; category: T }
  | { ok: false; response: NextResponse }

export async function requireCategory<T extends Prisma.CategorySelect>(
  categoryId: string,
  select?: T
): Promise<RequireCategoryResult<Prisma.CategoryGetPayload<{ select: T }>>> {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    select: (select ?? ({ id: true } as T)),
  })

  if (!category) {
    return {
      ok: false,
      response: formatNotFoundError('カテゴリ', categoryId),
    }
  }

  return { ok: true, category }
}
