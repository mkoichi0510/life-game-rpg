import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  updateCategorySchema,
  categoryIdParamSchema,
} from '@/lib/validations/category'
import { formatZodError } from '@/lib/validations/helpers'
import { requireUser, isUserFailure } from '@/lib/api/requireUser'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userResult = await requireUser()
  if (isUserFailure(userResult)) {
    return userResult.response
  }

  const { id } = await params

  // ID検証
  const idResult = categoryIdParamSchema.safeParse({ id })
  if (!idResult.success) {
    return formatZodError(idResult.error)
  }

  // リクエストボディ検証
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: { message: 'リクエストボディが不正です' } },
      { status: 400 }
    )
  }

  const result = updateCategorySchema.safeParse(body)
  if (!result.success) {
    return formatZodError(result.error)
  }

  // 存在確認
  const existing = await prisma.category.findFirst({
    where: { id, userId: userResult.userId },
  })
  if (!existing) {
    return NextResponse.json(
      { error: { message: 'カテゴリが見つかりません' } },
      { status: 404 }
    )
  }

  // 更新
  const category = await prisma.category.update({
    where: { id },
    data: result.data,
  })

  return NextResponse.json({ category })
}
