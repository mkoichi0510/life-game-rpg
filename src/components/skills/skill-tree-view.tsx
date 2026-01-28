"use client";

import { useEffect, useRef } from "react";
import type { KeyboardEvent } from "react";
import { SkillNodeItem } from "@/components/skills/skill-node";
import type { SkillNode } from "@/lib/api-client/client";
import { SKILL_NODE_STATE, type SkillNodeState } from "@/lib/constants";

interface SkillTreeViewProps {
  nodes: SkillNode[];
  nodeStates: Map<string, SkillNodeState>;
  selectedNodeId: string | null;
  onNodeSelect: (node: SkillNode) => void;
  onNodeActivate: (node: SkillNode) => void;
  colorClasses: { text: string; bg: string; border: string };
}

export function SkillTreeView({
  nodes,
  nodeStates,
  selectedNodeId,
  onNodeSelect,
  onNodeActivate,
  colorClasses,
}: SkillTreeViewProps) {
  const nodeRefs = useRef(new Map<string, HTMLButtonElement | null>());

  useEffect(() => {
    if (!selectedNodeId) return;
    const target = nodeRefs.current.get(selectedNodeId);
    target?.focus();
  }, [selectedNodeId]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!selectedNodeId) return;
    const currentIndex = nodes.findIndex((node) => node.id === selectedNodeId);
    if (currentIndex === -1) return;

    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      const next = nodes[Math.min(nodes.length - 1, currentIndex + 1)];
      if (next) onNodeSelect(next);
      event.preventDefault();
    }

    if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      const prev = nodes[Math.max(0, currentIndex - 1)];
      if (prev) onNodeSelect(prev);
      event.preventDefault();
    }

    if (event.key === "Enter" || event.key === " ") {
      const current = nodes[currentIndex];
      if (current) onNodeActivate(current);
      event.preventDefault();
    }
  };

  return (
    <div
      role="tree"
      aria-label="スキルツリー"
      onKeyDown={handleKeyDown}
      className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6"
    >
      {nodes.map((node, index) => (
        <SkillNodeItem
          key={node.id}
          ref={(el) => {
            nodeRefs.current.set(node.id, el);
          }}
          node={node}
          state={nodeStates.get(node.id) ?? SKILL_NODE_STATE.LOCKED}
          isSelected={node.id === selectedNodeId}
          isLast={index === nodes.length - 1}
          colorClasses={colorClasses}
          onActivate={onNodeActivate}
        />
      ))}
    </div>
  );
}
