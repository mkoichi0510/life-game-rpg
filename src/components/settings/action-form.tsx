"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type Category } from "@/lib/api-client/client";
import { selectClassName } from "@/lib/utils";

const unitPresets = ["回", "分", "km", "セット", "ページ", "問"];

const actionFormSchema = z.object({
  label: z
    .string()
    .min(1, "アクション名は必須です")
    .max(50, "アクション名は最大50文字までです"),
  categoryId: z.string().min(1, "カテゴリは必須です"),
  unit: z
    .string()
    .max(20, "単位は最大20文字までです")
    .optional()
    .transform((v) => (v && v.trim().length > 0 ? v.trim() : undefined)),
  order: z
    .number()
    .int("表示順序は整数で指定してください")
    .min(0, "表示順序は0以上で指定してください"),
});

export type ActionFormValues = z.infer<typeof actionFormSchema>;

type ActionFormProps = {
  categories: Category[];
  defaultCategoryId?: string;
  defaultOrder?: number;
  onSubmit: (values: ActionFormValues) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
};

export function ActionForm({
  categories,
  defaultCategoryId,
  defaultOrder,
  onSubmit,
  onCancel,
  isSubmitting,
}: ActionFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ActionFormValues>({
    resolver: zodResolver(actionFormSchema),
    defaultValues: {
      label: "",
      categoryId: defaultCategoryId ?? "",
      unit: "",
      order: defaultOrder ?? 1,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="label">アクション名</Label>
        <Input
          id="label"
          placeholder="例: 腹筋、ランニング"
          {...register("label")}
          aria-invalid={!!errors.label}
        />
        {errors.label && (
          <p className="text-sm text-destructive">{errors.label.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="categoryId">カテゴリ</Label>
        <select
          id="categoryId"
          className={selectClassName}
          {...register("categoryId")}
          aria-invalid={!!errors.categoryId}
          disabled={categories.length === 0}
        >
          <option value="">カテゴリを選択</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        {errors.categoryId && (
          <p className="text-sm text-destructive">{errors.categoryId.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="unit">単位</Label>
        <Input
          id="unit"
          list="unit-presets"
          placeholder="例: 回、分、km"
          {...register("unit")}
          aria-invalid={!!errors.unit}
        />
        <datalist id="unit-presets">
          {unitPresets.map((unit) => (
            <option key={unit} value={unit} />
          ))}
        </datalist>
        {errors.unit && (
          <p className="text-sm text-destructive">{errors.unit.message}</p>
        )}
        <p className="text-xs text-muted-foreground">
          未入力の場合は数量入力が不要なアクションになります。
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="order">表示順</Label>
        <Input
          id="order"
          type="number"
          min={0}
          {...register("order", { valueAsNumber: true })}
          aria-invalid={!!errors.order}
        />
        {errors.order && (
          <p className="text-sm text-destructive">{errors.order.message}</p>
        )}
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
