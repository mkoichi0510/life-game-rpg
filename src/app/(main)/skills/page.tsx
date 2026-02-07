"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { NodeUnlockDialog } from "@/components/skills/node-unlock-dialog";
import { SeasonalTitleBadge } from "@/components/skills/seasonal-title-badge";
import { SkillSteps } from "@/components/skills/skill-steps";
import { SkillTreeView } from "@/components/skills/skill-tree-view";
import { getCategoryColor, getCategoryColorKey } from "@/lib/category-ui";
import { SKILL_NODE_STATE, SKILL_STEP, type SkillStep } from "@/lib/constants";
import { getSkillNodeState } from "@/lib/skills/skill-node-state";
import { showError, showNodeUnlocked } from "@/lib/toast";
import { cn } from "@/lib/utils";
import {
  fetchCategories,
  fetchCurrentSeasonalTitle,
  fetchPlayerStates,
  fetchSkillNodes,
  fetchSkillTrees,
  unlockSkillNode,
  type Category,
  type PlayerCategoryState,
  type SeasonalTitleCurrent,
  type SkillNode,
  type SkillTree,
} from "@/lib/api-client/client";
import { getUserMessage } from "@/lib/api-client/errors";

export default function SkillsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [playerStates, setPlayerStates] = useState<PlayerCategoryState[]>([]);
  const [trees, setTrees] = useState<SkillTree[]>([]);
  const [nodesByTreeId, setNodesByTreeId] = useState<Map<string, SkillNode[]>>(
    new Map()
  );
  const [seasonalTitle, setSeasonalTitle] =
    useState<SeasonalTitleCurrent | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );
  const [selectedTreeId, setSelectedTreeId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [loadingBase, setLoadingBase] = useState(true);
  const [loadingTrees, setLoadingTrees] = useState(false);
  const [unlockDialogOpen, setUnlockDialogOpen] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const latestCategoryIdRef = useRef<string | null>(null);
  const selectedCategoryIdRef = useRef<string | null>(null);
  const selectedTreeIdRef = useRef<string | null>(null);
  const pendingAutoScrollRef = useRef<SkillStep | null>(null);
  const categorySectionRef = useRef<HTMLDivElement | null>(null);
  const treeSectionRef = useRef<HTMLDivElement | null>(null);
  const treeViewSectionRef = useRef<HTMLDivElement | null>(null);

  const playerStateMap = useMemo(
    () => new Map(playerStates.map((state) => [state.categoryId, state])),
    [playerStates]
  );

  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === selectedCategoryId) ?? null,
    [categories, selectedCategoryId]
  );

  const selectedTree = useMemo(
    () => trees.find((tree) => tree.id === selectedTreeId) ?? null,
    [trees, selectedTreeId]
  );

  const selectedNodes = useMemo(() => {
    if (!selectedTreeId) return [];
    return nodesByTreeId.get(selectedTreeId) ?? [];
  }, [nodesByTreeId, selectedTreeId]);

  const orderedNodes = useMemo(
    () =>
      selectedNodes
        .slice()
        .sort((a, b) => a.order - b.order || a.id.localeCompare(b.id)),
    [selectedNodes]
  );

  const selectedNode = useMemo(
    () => orderedNodes.find((node) => node.id === selectedNodeId) ?? null,
    [orderedNodes, selectedNodeId]
  );

  const prerequisiteNode = useMemo(() => {
    if (!selectedNode) return null;
    return (
      orderedNodes.find((node) => node.order === selectedNode.order - 1) ?? null
    );
  }, [orderedNodes, selectedNode]);

  const spUnspent = selectedCategoryId
    ? playerStateMap.get(selectedCategoryId)?.spUnspent ?? 0
    : 0;

  const nodeStates = useMemo(() => {
    const map = new Map<string, ReturnType<typeof getSkillNodeState>>();
    for (const node of orderedNodes) {
      const prev =
        orderedNodes.find((other) => other.order === node.order - 1) ?? null;
      map.set(node.id, getSkillNodeState(node, prev, spUnspent));
    }
    return map;
  }, [orderedNodes, spUnspent]);

  const treeProgressMap = useMemo(() => {
    const map = new Map<string, { unlocked: number; total: number }>();
    for (const tree of trees) {
      const nodes = nodesByTreeId.get(tree.id) ?? [];
      const unlocked = nodes.filter((node) => node.isUnlocked).length;
      map.set(tree.id, { unlocked, total: nodes.length });
    }
    return map;
  }, [nodesByTreeId, trees]);

  const resolveDefaultCategoryId = useCallback(
    async (nextCategories: Category[]) => {
      if (nextCategories.length === 0) return null;

      for (const category of nextCategories) {
        try {
          const treesResponse = await fetchSkillTrees(category.id, true);
          if (treesResponse.trees.length > 0) {
            return category.id;
          }
        } catch {
          // エラーは無視して次へ
        }
      }

      return nextCategories[0]?.id ?? null;
    },
    []
  );

  const loadBaseData = useCallback(async () => {
    setLoadingBase(true);
    try {
      const [categoriesResponse, playerStatesResponse] = await Promise.all([
        fetchCategories(true),
        fetchPlayerStates(),
      ]);
      const sortedCategories = categoriesResponse.categories
        .slice()
        .sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
      setCategories(sortedCategories);
      setPlayerStates(playerStatesResponse.playerStates);
      if (!selectedCategoryIdRef.current && sortedCategories.length > 0) {
        const defaultCategoryId = await resolveDefaultCategoryId(sortedCategories);
        if (!selectedCategoryIdRef.current && defaultCategoryId) {
          setSelectedCategoryId(defaultCategoryId);
        }
      }
    } catch (error) {
      const message = getUserMessage(error, "カテゴリの取得に失敗しました");
      showError(message);
    } finally {
      setLoadingBase(false);
    }
  }, [resolveDefaultCategoryId]);

  const loadTreeNodes = useCallback(async (treeId: string) => {
    const response = await fetchSkillNodes(treeId);
    return response.nodes;
  }, []);

  const loadCategoryData = useCallback(
    async (categoryId: string) => {
      setLoadingTrees(true);
      latestCategoryIdRef.current = categoryId;
      try {
        const [treesResponse, seasonalResponse] = await Promise.all([
          fetchSkillTrees(categoryId, true),
          fetchCurrentSeasonalTitle(categoryId),
        ]);

        if (latestCategoryIdRef.current !== categoryId) return;
        const sortedTrees = treesResponse.trees
          .slice()
          .sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
        setTrees(sortedTrees);
        setSeasonalTitle(seasonalResponse);

        const nodesEntries = await Promise.all(
          sortedTrees.map(
            async (tree) => [tree.id, await loadTreeNodes(tree.id)] as const
          )
        );
        if (latestCategoryIdRef.current !== categoryId) return;
        setNodesByTreeId(new Map(nodesEntries));

        if (sortedTrees.length > 0) {
          const currentTreeId = selectedTreeIdRef.current;
          const nextTreeId =
            currentTreeId &&
            sortedTrees.some((tree) => tree.id === currentTreeId)
              ? currentTreeId
              : null;
          setSelectedTreeId(nextTreeId);
        } else {
          setSelectedTreeId(null);
        }
      } catch (error) {
        const message = getUserMessage(error, "スキルツリーの取得に失敗しました");
        showError(message);
        setTrees([]);
        setNodesByTreeId(new Map());
      } finally {
        if (latestCategoryIdRef.current === categoryId) {
          setLoadingTrees(false);
        }
      }
    },
    [loadTreeNodes]
  );

  const refreshSelectedTreeNodes = useCallback(async () => {
    if (!selectedTreeId) return;
    try {
      const nodes = await loadTreeNodes(selectedTreeId);
      setNodesByTreeId((prev) => {
        const next = new Map(prev);
        next.set(selectedTreeId, nodes);
        return next;
      });
    } catch (error) {
      const message = getUserMessage(error, "ノードの取得に失敗しました");
      showError(message);
    }
  }, [loadTreeNodes, selectedTreeId]);

  useEffect(() => {
    selectedCategoryIdRef.current = selectedCategoryId;
  }, [selectedCategoryId]);

  useEffect(() => {
    selectedTreeIdRef.current = selectedTreeId;
  }, [selectedTreeId]);

  useEffect(() => {
    loadBaseData();
  }, [loadBaseData]);

  useEffect(() => {
    if (!selectedCategoryId) return;
    loadCategoryData(selectedCategoryId);
  }, [loadCategoryData, selectedCategoryId]);

  useEffect(() => {
    if (!selectedTreeId) return;
    const nodes = nodesByTreeId.get(selectedTreeId) ?? [];
    if (nodes.length === 0) {
      setSelectedNodeId(null);
      return;
    }
    if (!selectedNodeId || !nodes.find((node) => node.id === selectedNodeId)) {
      setSelectedNodeId(nodes[0].id);
    }
  }, [nodesByTreeId, selectedNodeId, selectedTreeId]);

  const handleCategorySelect = (categoryId: string) => {
    pendingAutoScrollRef.current = SKILL_STEP.TREE_SELECT;
    setSelectedCategoryId(categoryId);
    setSelectedTreeId(null);
    setSelectedNodeId(null);
  };

  const handleTreeSelect = (treeId: string) => {
    pendingAutoScrollRef.current = SKILL_STEP.SKILL_TREE;
    setSelectedTreeId(treeId);
    const nodes = nodesByTreeId.get(treeId) ?? [];
    setSelectedNodeId(nodes[0]?.id ?? null);
  };

  const handleNodeSelect = (node: SkillNode) => {
    setSelectedNodeId(node.id);
  };

  const handleNodeActivate = (node: SkillNode) => {
    setSelectedNodeId(node.id);
    setUnlockDialogOpen(true);
  };

  const currentStep: SkillStep = !selectedCategoryId
    ? SKILL_STEP.CATEGORY_SELECT
    : !selectedTreeId
      ? SKILL_STEP.TREE_SELECT
      : SKILL_STEP.SKILL_TREE;

  const handleStepClick = useCallback((step: SkillStep) => {
    const target =
      step === SKILL_STEP.CATEGORY_SELECT
        ? categorySectionRef.current
        : step === SKILL_STEP.TREE_SELECT
          ? treeSectionRef.current
          : treeViewSectionRef.current;
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  useEffect(() => {
    const pending = pendingAutoScrollRef.current;
    if (!pending) return;

    // ローディング中はスクロールしない
    if (loadingTrees) return;

    if (pending === SKILL_STEP.TREE_SELECT && selectedCategoryId) {
      treeSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      pendingAutoScrollRef.current = null;
      return;
    }

    if (pending === SKILL_STEP.SKILL_TREE && selectedTreeId) {
      treeViewSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      pendingAutoScrollRef.current = null;
    }
  }, [selectedCategoryId, selectedTreeId, loadingTrees]);

  const handleUnlock = async () => {
    if (!selectedNode || !selectedCategoryId) return;
    if (nodeStates.get(selectedNode.id) !== SKILL_NODE_STATE.UNLOCKABLE) return;

    setUnlocking(true);
    try {
      await unlockSkillNode(selectedNode.id);
      const remainingSp = Math.max(0, spUnspent - selectedNode.costSp);
      showNodeUnlocked(selectedNode.title, selectedNode.costSp, remainingSp);
      await Promise.all([
        fetchPlayerStates().then((res) => setPlayerStates(res.playerStates)),
        refreshSelectedTreeNodes(),
      ]);
      setUnlockDialogOpen(false);
    } catch (error) {
      const message = getUserMessage(error, "ノード解放に失敗しました");
      showError(message);
    } finally {
      setUnlocking(false);
    }
  };

  const colorClasses = selectedCategory
    ? getCategoryColor(selectedCategory)
    : getCategoryColor({ id: "life", name: "ライフ" });

  const categoryTabs = (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Step 1. カテゴリ選択</CardTitle>
      </CardHeader>
      <CardContent>
        {loadingBase ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {[...Array(4)].map((_, index) => (
              <Skeleton key={index} className="h-20 w-full" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            表示できるカテゴリがありません。
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {categories.map((category) => {
              const isActive = category.id === selectedCategoryId;
              const colorKey = getCategoryColorKey(category);
              const color = getCategoryColor(category);
              const sp = playerStateMap.get(category.id)?.spUnspent ?? 0;
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => handleCategorySelect(category.id)}
                  data-testid={`skill-category-${category.id}`}
                  className={cn(
                    "flex w-full flex-col items-start gap-2 rounded-xl border px-4 py-3 text-left text-sm font-semibold transition",
                    isActive
                      ? `${color.border} ${color.text} bg-muted/40`
                      : "border-border text-foreground hover:bg-muted/40"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={cn("h-2.5 w-2.5 rounded-full", color.bg)}
                      aria-hidden
                    />
                    <span>{category.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    未使用SP: {sp}
                  </span>
                  <span className="sr-only">{colorKey}</span>
                </button>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const treeTabs = (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Step 2. ツリー選択</CardTitle>
      </CardHeader>
      <CardContent>
        {loadingTrees ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {[...Array(2)].map((_, index) => (
              <Skeleton key={index} className="h-20 w-full" />
            ))}
          </div>
        ) : trees.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            このカテゴリにはまだスキルツリーがありません。
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {trees.map((tree) => {
              const isActive = tree.id === selectedTreeId;
              const progress = treeProgressMap.get(tree.id) ?? {
                unlocked: 0,
                total: 0,
              };
              return (
                <button
                  key={tree.id}
                  type="button"
                  onClick={() => handleTreeSelect(tree.id)}
                  data-testid={`skill-tree-${tree.id}`}
                  className={cn(
                    "flex w-full flex-col items-start gap-2 rounded-xl border px-4 py-3 text-left text-sm font-semibold transition",
                    isActive
                      ? `${colorClasses.border} ${colorClasses.text} bg-muted/40`
                      : "border-border text-foreground hover:bg-muted/40"
                  )}
                >
                  <span>{tree.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {progress.unlocked}/{progress.total} 解放済み
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const treeSection = (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Step 3. スキルツリー</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loadingTrees ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, index) => (
              <Skeleton key={index} className="h-14 w-full" />
            ))}
          </div>
        ) : !selectedTree ? (
          <p className="text-sm text-muted-foreground">
            表示できるツリーがありません。
          </p>
        ) : orderedNodes.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            このツリーにはノードがありません。
          </p>
        ) : (
          <>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">選択中のツリー</p>
              <p className="text-lg font-semibold">{selectedTree.name}</p>
            </div>
            <SkillTreeView
              nodes={orderedNodes}
              nodeStates={nodeStates}
              selectedNodeId={selectedNodeId}
              onNodeSelect={handleNodeSelect}
              onNodeActivate={handleNodeActivate}
              colorClasses={colorClasses}
            />
            <div className="text-xs text-muted-foreground">
              凡例: [✓]解放済 [★]解放可 [○]未解放
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 pb-10">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/">
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">ホームへ戻る</span>
          </Link>
        </Button>
        <div>
          <p className="text-xs text-muted-foreground">スキルツリー</p>
          <h2 className="text-xl font-semibold">スキルツリーを見る</h2>
        </div>
      </div>

      <SkillSteps currentStep={currentStep} onStepClick={handleStepClick} />

      <div ref={categorySectionRef} className="scroll-mt-24">
        {categoryTabs}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">進捗とSP</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">未使用SP</span>
            <span className="text-sp-gradient text-lg font-semibold">
              {spUnspent} SP
            </span>
          </div>
          {seasonalTitle && selectedCategoryId ? (
            <SeasonalTitleBadge
              title={seasonalTitle.currentTitle?.label ?? null}
              totalSpEarned={seasonalTitle.totalSpEarned}
              rankWindowDays={seasonalTitle.rankWindowDays}
            />
          ) : (
            <Skeleton className="h-8 w-48" />
          )}
        </CardContent>
      </Card>

      {selectedCategoryId && (
        <div ref={treeSectionRef} className="scroll-mt-24">
          {treeTabs}
        </div>
      )}
      {selectedTreeId && (
        <div ref={treeViewSectionRef} className="scroll-mt-24">
          {treeSection}
        </div>
      )}

      <NodeUnlockDialog
        open={unlockDialogOpen}
        onOpenChange={setUnlockDialogOpen}
        node={selectedNode}
        nodeState={selectedNode ? nodeStates.get(selectedNode.id) ?? SKILL_NODE_STATE.LOCKED : SKILL_NODE_STATE.LOCKED}
        spUnspent={spUnspent}
        prerequisiteNode={prerequisiteNode}
        onUnlock={handleUnlock}
        unlocking={unlocking}
      />

      {loadingTrees && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          データを読み込み中...
        </div>
      )}
    </div>
  );
}
