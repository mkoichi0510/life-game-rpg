import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { spendLogsQuerySchema } from '@/lib/validations/player'
import {
  formatInternalError,
  formatZodError,
} from '@/lib/validations/helpers'
import { requireCategory, isCategoryFailure } from '@/lib/api/requireCategory'
import { SPEND_LOG_TYPE } from '@/lib/constants'
import { requireUser, isUserFailure } from '@/lib/api/requireUser'

/**
 * GET /api/player/spend-logs
 * SP消費履歴を取得
 * クエリパラメータ:
 *   - categoryId: 対象カテゴリID（必須）
 */
export async function GET(request: NextRequest) {
  try {
    const userResult = await requireUser()
    if (isUserFailure(userResult)) {
      return userResult.response
    }

    const { searchParams } = new URL(request.url)
    const query = {
      categoryId: searchParams.get('categoryId') ?? undefined,
      limit: searchParams.get('limit') ?? undefined,
      cursor: searchParams.get('cursor') ?? undefined,
    }
    const result = spendLogsQuerySchema.safeParse(query)

    if (!result.success) {
      return formatZodError(result.error)
    }

    if (result.data.categoryId) {
      const categoryResult = await requireCategory(
        userResult.userId,
        result.data.categoryId
      )
      if (isCategoryFailure(categoryResult)) {
        return categoryResult.response
      }
    }

    let cursorAt: Date | null = null
    let cursorId: string | null = null
    if (result.data.cursor) {
      const [atPart, ...idParts] = result.data.cursor.split('__')
      cursorAt = new Date(atPart)
      cursorId = idParts.join('__')
    }

    const where = {
      userId: userResult.userId,
      ...(result.data.categoryId && { categoryId: result.data.categoryId }),
      ...(cursorAt &&
        cursorId && {
          OR: [
            { at: { lt: cursorAt } },
            { AND: [{ at: cursorAt }, { id: { lt: cursorId } }] },
          ],
        }),
    }

    const spendLogs = await prisma.spendLog.findMany({
      where,
      orderBy: [{ at: 'desc' }, { id: 'desc' }],
      take: result.data.limit + 1,
      select: {
        id: true,
        at: true,
        categoryId: true,
        type: true,
        costSp: true,
        refId: true,
        dayKey: true,
        createdAt: true,
      },
    })

    const hasNext = spendLogs.length > result.data.limit
    const logsForResponse = hasNext
      ? spendLogs.slice(0, result.data.limit)
      : spendLogs

    const nodeIds = [
      ...new Set(
        logsForResponse
          .filter((log) => log.type === SPEND_LOG_TYPE.UNLOCK_NODE)
          .map((log) => log.refId)
      ),
    ]

    const skillNodes =
      nodeIds.length > 0
        ? await prisma.skillNode.findMany({
            where: { id: { in: nodeIds }, userId: userResult.userId },
            select: {
              id: true,
              title: true,
              costSp: true,
              treeId: true,
              order: true,
            },
          })
        : []

    const skillNodeMap = new Map(skillNodes.map((node) => [node.id, node]))

    const logs = logsForResponse.map((log) => ({
      id: log.id,
      categoryId: log.categoryId,
      at: log.at,
      costSp: log.costSp,
      skillNode:
        log.type === SPEND_LOG_TYPE.UNLOCK_NODE
          ? skillNodeMap.get(log.refId) ?? null
          : null,
      createdAt: log.createdAt,
    }))

    const lastLog = logsForResponse[logsForResponse.length - 1]
    const nextCursor =
      hasNext && lastLog
        ? `${lastLog.at.toISOString()}__${lastLog.id}`
        : null

    return NextResponse.json({ logs, nextCursor })
  } catch (error) {
    console.error('Failed to fetch spend logs:', error)
    return formatInternalError('SP消費履歴の取得に失敗しました')
  }
}
