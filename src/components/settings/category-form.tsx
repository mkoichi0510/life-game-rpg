"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { DEFAULTS } from "@/lib/constants";

const categoryFormSchema = z.object({
  name: z
    .string()
    .min(1, "カテゴリ名は必須です")
    .max(50, "カテゴリ名は最大50文字までです"),
  visible: z.boolean(),
  xpPerPlay: z
    .number()
    .int("XP/Playは整数で指定してください")
    .min(1, "XP/Playは1以上で指定してください"),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;

type CategoryFormProps = {
  onSubmit: (values: CategoryFormValues) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
};

export function CategoryForm({ onSubmit, onCancel, isSubmitting }: CategoryFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: "",
      visible: true,
      xpPerPlay: DEFAULTS.XP_PER_PLAY,
    },
  });

  const visibleValue = watch("visible");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">カテゴリ名</Label>
        <Input
          id="name"
          placeholder="例: 健康、資格勉強"
          {...register("name")}
          aria-invalid={!!errors.name}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="xpPerPlay">XP/Play</Label>
        <Input
          id="xpPerPlay"
          type="number"
          min={1}
          {...register("xpPerPlay", { valueAsNumber: true })}
          aria-invalid={!!errors.xpPerPlay}
        />
        {errors.xpPerPlay && (
          <p className="text-sm text-destructive">{errors.xpPerPlay.message}</p>
        )}
        <p className="text-xs text-muted-foreground">
          1プレイあたりに獲得するXP（経験値）
        </p>
      </div>

      <div className="flex items-center justify-between rounded-lg border p-3">
        <div className="space-y-0.5">
          <Label htmlFor="visible" className="cursor-pointer">
            表示する
          </Label>
          <p className="text-xs text-muted-foreground">
            オフにすると一覧から非表示になります
          </p>
        </div>
        <Switch
          id="visible"
          checked={visibleValue}
          onCheckedChange={(checked) => setValue("visible", checked)}
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          キャンセル
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "保存中..." : "保存"}
        </Button>
      </div>
    </form>
  );
}
