"use client";

import { forwardRef } from "react";
import { Check, Circle, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { SKILL_NODE_STATE, type SkillNodeState } from "@/lib/constants";
import type { SkillNode } from "@/lib/api-client/client";

interface SkillNodeProps {
  node: SkillNode;
  state: SkillNodeState;
  isSelected: boolean;
  isLast: boolean;
  colorClasses: { text: string; bg: string; border: string };
  onActivate: (node: SkillNode) => void;
}

export const SkillNodeItem = forwardRef<HTMLButtonElement, SkillNodeProps>(
  ({ node, state, isSelected, isLast, colorClasses, onActivate }, ref) => {
    const isUnlocked = state === SKILL_NODE_STATE.UNLOCKED;
    const isUnlockable = state === SKILL_NODE_STATE.UNLOCKABLE;

    const stateLabel = isUnlocked
      ? "解放済み"
      : isUnlockable
        ? `解放可能、${node.costSp}SP必要`
        : "解放不可";

    const Icon = isUnlocked ? Check : isUnlockable ? Star : Circle;

    return (
      <div className="flex flex-col items-center lg:flex-row">
        <button
          ref={ref}
          type="button"
          role="treeitem"
          aria-selected={isSelected}
          aria-disabled={!isUnlockable && !isUnlocked}
          aria-label={`${node.title}、${stateLabel}`}
          onClick={() => onActivate(node)}
          data-testid={`skill-node-${node.id}`}
          className={cn(
            "flex min-h-[48px] w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            isSelected && "ring-2 ring-ring ring-offset-2",
            isUnlocked && `${colorClasses.border} bg-white/80 text-foreground`,
            isUnlockable &&
              `${colorClasses.border} bg-muted/20 text-foreground animate-pulse-glow`,
            !isUnlocked && !isUnlockable && "bg-muted/30 text-muted-foreground"
          )}
          tabIndex={isSelected ? 0 : -1}
        >
          <span
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full border text-xs",
              isUnlocked && `${colorClasses.bg} text-white border-transparent`,
              isUnlockable && `${colorClasses.border} ${colorClasses.text}`,
              !isUnlocked && !isUnlockable && "border-border text-muted-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
          </span>
          <div className="flex flex-col">
            <span>{node.title}</span>
            <span className="text-xs text-muted-foreground">
              {node.costSp} SP
            </span>
          </div>
        </button>
        {!isLast && (
          <div
            aria-hidden
            className="h-6 w-px bg-border lg:ml-4 lg:h-px lg:w-10"
          />
        )}
      </div>
    );
  }
);

SkillNodeItem.displayName = "SkillNodeItem";
