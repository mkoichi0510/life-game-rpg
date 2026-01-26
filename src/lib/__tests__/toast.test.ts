import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}))

import { toast } from 'sonner'
import {
  showXpGained,
  showSpGained,
  showDayConfirmed,
  showNodeUnlocked,
  showError,
  showInfo,
} from '../toast'

describe('toast helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('showXpGained', () => {
    it('正しいパラメータでtoast.successを呼ぶ', () => {
      showXpGained(100)
      expect(toast.success).toHaveBeenCalledWith('+100 XP', {
        description: 'プレイを記録しました',
        duration: 3000,
      })
    })

    it('異なるXP値でも正しく動作する', () => {
      showXpGained(50)
      expect(toast.success).toHaveBeenCalledWith('+50 XP', {
        description: 'プレイを記録しました',
        duration: 3000,
      })
    })
  })

  describe('showSpGained', () => {
    it('正しいパラメータでtoast.successを呼ぶ', () => {
      showSpGained(5)
      expect(toast.success).toHaveBeenCalledWith('+5 SP 獲得！', {
        description: '日次確定が完了しました',
        duration: 4000,
      })
    })
  })

  describe('showDayConfirmed', () => {
    it('正しいパラメータでtoast.successを呼ぶ', () => {
      showDayConfirmed(200, 10)
      expect(toast.success).toHaveBeenCalledWith('今日を確定しました', {
        description: '+200 XP / +10 SP',
        duration: 4000,
      })
    })
  })

  describe('showNodeUnlocked', () => {
    it('正しいパラメータでtoast.successを呼ぶ', () => {
      showNodeUnlocked('ランニング初心者')
      expect(toast.success).toHaveBeenCalledWith('称号を獲得！', {
        description: 'ランニング初心者',
        duration: 4000,
      })
    })
  })

  describe('showError', () => {
    it('正しいパラメータでtoast.errorを呼ぶ', () => {
      showError('通信エラーが発生しました')
      expect(toast.error).toHaveBeenCalledWith('エラー', {
        description: '通信エラーが発生しました',
        duration: 5000,
      })
    })
  })

  describe('showInfo', () => {
    it('descriptionなしで正しく動作する', () => {
      showInfo('お知らせ')
      expect(toast.info).toHaveBeenCalledWith('お知らせ', {
        description: undefined,
        duration: 3000,
      })
    })

    it('descriptionありで正しく動作する', () => {
      showInfo('お知らせ', '詳細なメッセージ')
      expect(toast.info).toHaveBeenCalledWith('お知らせ', {
        description: '詳細なメッセージ',
        duration: 3000,
      })
    })
  })
})
