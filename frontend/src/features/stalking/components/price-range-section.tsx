import { useFormContext } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type { StalkingFormData } from "../types";

export function PriceRangeSection() {
  const {
    register,
    formState: { errors },
  } = useFormContext<StalkingFormData>();

  return (
    <div className="bg-card mx-6 my-4 rounded-lg border p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold">
        Zakres cenowy (opcjonalnie)
      </h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="minPrice">Cena minimalna (PLN)</Label>
          <Input
            id="minPrice"
            type="number"
            step="0.01"
            min="0"
            placeholder="np. 50"
            {...register("minPrice")}
          />
          {errors.minPrice && (
            <p className="text-destructive text-sm">
              {errors.minPrice.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="maxPrice">Cena maksymalna (PLN)</Label>
          <Input
            id="maxPrice"
            type="number"
            step="0.01"
            min="0"
            placeholder="np. 200"
            {...register("maxPrice")}
          />
          {errors.maxPrice && (
            <p className="text-destructive text-sm">
              {errors.maxPrice.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
