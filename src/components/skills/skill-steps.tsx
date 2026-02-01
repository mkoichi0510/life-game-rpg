"use client";

import { Check, Circle, CircleDot, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type SkillStep = 1 | 2 | 3;

interface SkillStepsProps {
  currentStep: SkillStep;
  onStepClick: (step: SkillStep) => void;
}

const steps: { id: SkillStep; label: string }[] = [
  { id: 1, label: "カテゴリ選択" },
  { id: 2, label: "ツリー選択" },
  { id: 3, label: "スキルツリー" },
];

const stepValue = (step: SkillStep) => `step-${step}`;

export function SkillSteps({ currentStep, onStepClick }: SkillStepsProps) {
  const handleValueChange = (value: string) => {
    const parsed = Number(value.replace("step-", ""));
    const validStepIds = steps.map((s) => s.id);
    if (!validStepIds.includes(parsed as SkillStep)) return;
    const step = parsed as SkillStep;
    if (step > currentStep) return;
    onStepClick(step);
  };

  return (
    <Tabs value={stepValue(currentStep)} onValueChange={handleValueChange}>
      <TabsList className="w-full flex-col gap-2 bg-transparent p-0 text-foreground sm:flex-row sm:items-center sm:justify-start sm:gap-3">
        {steps.map((step, index) => {
          const isCompleted = step.id < currentStep;
          const isCurrent = step.id === currentStep;
          const Icon = isCompleted ? Check : isCurrent ? CircleDot : Circle;

          return (
            <div
              key={step.id}
              className="flex w-full items-center gap-2 sm:w-auto"
            >
              <TabsTrigger
                value={stepValue(step.id)}
                disabled={step.id > currentStep}
                aria-current={isCurrent ? "step" : undefined}
                className={cn(
                  "w-full justify-start gap-2 rounded-md border px-3 py-2 text-xs font-semibold shadow-none sm:w-auto sm:justify-center sm:text-sm",
                  "data-[state=active]:bg-primary/5 data-[state=active]:text-foreground data-[state=active]:shadow-none",
                  isCompleted && "border-border text-foreground/80",
                  isCurrent && "border-primary",
                  !isCompleted && !isCurrent && "border-border text-muted-foreground"
                )}
              >
                <Icon className="h-4 w-4" aria-hidden />
                <span>
                  {step.id}. {step.label}
                </span>
              </TabsTrigger>
              {index < steps.length - 1 && (
                <ChevronRight
                  className="hidden h-4 w-4 text-muted-foreground sm:inline-flex"
                  aria-hidden
                />
              )}
            </div>
          );
        })}
      </TabsList>
    </Tabs>
  );
}
