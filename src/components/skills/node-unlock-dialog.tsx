"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SKILL_NODE_STATE, type SkillNodeState } from "@/lib/constants";
import type { SkillNode } from "@/lib/api-client/client";

interface NodeUnlockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  node: SkillNode | null;
  nodeState: SkillNodeState;
  spUnspent: number;
  prerequisiteNode: SkillNode | null;
  onUnlock: () => void;
  unlocking: boolean;
}

export function NodeUnlockDialog({
  open,
  onOpenChange,
  node,
  nodeState,
  spUnspent,
  prerequisiteNode,
  onUnlock,
  unlocking,
}: NodeUnlockDialogProps) {
  if (!node) return null;

  const canUnlock = nodeState === SKILL_NODE_STATE.UNLOCKABLE;
  const isFirstNode = node.order === 1;
  const prerequisiteLabel = isFirstNode
    ? "前提: なし"
    : `前提: ${prerequisiteNode?.title ?? "未解放"}`;
  const spShort =
    nodeState === SKILL_NODE_STATE.LOCKED && spUnspent < node.costSp;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{node.title}</DialogTitle>
          <DialogDescription>説明は未登録です</DialogDescription>
        </DialogHeader>

        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">解放コスト</span>
            <span className="font-semibold">{node.costSp} SP</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">あなたのSP</span>
            <span className="font-semibold">{spUnspent} SP</span>
          </div>
          <p className="text-xs text-muted-foreground">{prerequisiteLabel}</p>
          {spShort && (
            <p className="text-xs text-muted-foreground">
              SPが不足しています
            </p>
          )}
          {!isFirstNode && !prerequisiteNode?.isUnlocked && (
            <p className="text-xs text-muted-foreground">
              前提ノードが未解放です
            </p>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <DialogClose asChild>
            <Button variant="outline">閉じる</Button>
          </DialogClose>
          <Button
            variant="xp"
            onClick={onUnlock}
            disabled={!canUnlock || unlocking}
          >
            {unlocking ? "解放中..." : "解放する"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
