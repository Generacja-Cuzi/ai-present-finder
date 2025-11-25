import { useState } from "react";
import { useFormContext } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import type { StalkingFormData } from "../types";

type BudgetOption = "under50" | "50-100" | "100-200" | "other";

const budgetOptions: {
  id: BudgetOption;
  label: string;
  minPrice?: number;
  maxPrice?: number;
}[] = [
  { id: "under50", label: "Do 50zł", maxPrice: 50 },
  { id: "50-100", label: "50-100zł", minPrice: 50, maxPrice: 100 },
  { id: "100-200", label: "100-200zł", minPrice: 100, maxPrice: 200 },
  { id: "other", label: "Inny" },
];

export function BudgetSection() {
  const {
    setValue,
    watch,
    register,
    formState: { errors },
  } = useFormContext<StalkingFormData>();

  const minPrice = watch("minPrice");
  const maxPrice = watch("maxPrice");

  const [selectedBudget, setSelectedBudget] = useState<BudgetOption | null>(
    () => {
      // Determine initial selection based on current values
      if (
        maxPrice === 50 &&
        (minPrice === undefined || Number.isNaN(minPrice))
      ) {
        return "under50";
      }
      if (minPrice === 50 && maxPrice === 100) {
        return "50-100";
      }
      if (minPrice === 100 && maxPrice === 200) {
        return "100-200";
      }
      if (
        minPrice !== undefined ||
        (maxPrice !== undefined &&
          maxPrice !== 50 &&
          maxPrice !== 100 &&
          maxPrice !== 200)
      ) {
        return "other";
      }
      return null;
    },
  );

  const handleBudgetSelect = (option: BudgetOption) => {
    setSelectedBudget(option);

    const selected = budgetOptions.find((o) => o.id === option);
    if (selected !== undefined && option !== "other") {
      setValue("minPrice", selected.minPrice, { shouldValidate: true });
      setValue("maxPrice", selected.maxPrice, { shouldValidate: true });
    } else if (option === "other") {
      // Clear values for custom input
      setValue("minPrice", undefined, { shouldValidate: true });
      setValue("maxPrice", undefined, { shouldValidate: true });
    }
  };

  return (
    <section className="mb-8">
      <h3 className="text-muted-foreground mb-4 text-base">
        Jaki jest Twój budżet?
      </h3>

      <div className="grid grid-cols-2 gap-3">
        {budgetOptions.map((option) => (
          <Button
            key={option.id}
            type="button"
            variant="ghost"
            className={cn(
              "h-12 rounded-xl border-2 text-base font-medium transition-all duration-200",
              selectedBudget === option.id
                ? "border-primary text-foreground bg-[#FFF8F0]"
                : "bg-background text-muted-foreground border-gray-200 hover:border-gray-300 hover:bg-gray-50",
            )}
            onClick={() => {
              handleBudgetSelect(option.id);
            }}
          >
            {option.label}
          </Button>
        ))}
      </div>

      {selectedBudget === "other" && (
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Input
              id="minPrice"
              type="number"
              step="1"
              min="0"
              inputMode="numeric"
              placeholder="Min (zł)"
              {...register("minPrice", { valueAsNumber: true })}
              className="h-12 rounded-xl border-2 border-gray-200 text-base"
            />
            {errors.minPrice != null && (
              <p className="text-sm text-red-500">{errors.minPrice.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Input
              id="maxPrice"
              type="number"
              step="1"
              min="0"
              inputMode="numeric"
              placeholder="Max (zł)"
              {...register("maxPrice", { valueAsNumber: true })}
              className="h-12 rounded-xl border-2 border-gray-200 text-base"
            />
            {errors.maxPrice != null && (
              <p className="text-sm text-red-500">{errors.maxPrice.message}</p>
            )}
          </div>
        </div>
      )}

      {errors.root !== undefined && (
        <p className="mt-2 text-sm text-red-500">{errors.root.message}</p>
      )}
    </section>
  );
}
