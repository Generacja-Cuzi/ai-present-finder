import { useFormContext } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type { StalkingFormData } from "../types";

export function PriceRangeSection() {
  const {
    register,
    formState: { errors },
    trigger,
    getValues,
  } = useFormContext<StalkingFormData>();

  return (
    <section className="mb-8">
      <h2 className="text-foreground mb-2 text-xl font-bold">
        Zakres cenowy (opcjonalnie)
      </h2>
      <p className="mb-4 text-base text-gray-500">
        Określ przedział cenowy, w którym chcesz szukać prezentu.
      </p>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="minPrice" className="text-sm font-medium">
            Cena minimalna (PLN)
          </Label>
          {(() => {
            const minReg = register("minPrice", {
              valueAsNumber: true,
              validate: (value) => {
                const max = getValues("maxPrice");
                if (value == null) {
                  return true;
                }
                if (max == null) {
                  return true;
                }
                return (
                  value <= max ||
                  "Cena minimalna musi być mniejsza lub równa cenie maksymalnej"
                );
              },
            });

            return (
              <Input
                id="minPrice"
                type="number"
                step="0.01"
                min="0"
                placeholder="np. 50"
                {...minReg}
                onChange={(event) => {
                  void minReg.onChange(event);
                  void trigger("maxPrice");
                }}
                className="w-full"
              />
            );
          })()}
          {errors.minPrice != null && (
            <p className="text-sm text-red-500">{errors.minPrice.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="maxPrice" className="text-sm font-medium">
            Cena maksymalna (PLN)
          </Label>
          {(() => {
            const maxReg = register("maxPrice", {
              valueAsNumber: true,
              validate: (value) => {
                const min = getValues("minPrice");
                if (value == null) {
                  return true;
                }
                if (min == null) {
                  return true;
                }
                return (
                  value >= min ||
                  "Cena minimalna musi być mniejsza lub równa cenie maksymalnej"
                );
              },
            });

            return (
              <Input
                id="maxPrice"
                type="number"
                step="0.01"
                min="0"
                placeholder="np. 200"
                {...maxReg}
                onChange={(event) => {
                  void maxReg.onChange(event);
                  void trigger("minPrice");
                }}
                className="w-full"
              />
            );
          })()}
          {errors.maxPrice != null && (
            <p className="text-sm text-red-500">{errors.maxPrice.message}</p>
          )}
        </div>
      </div>
      {errors.root !== undefined && (
        <p className="mt-2 text-sm text-red-500">{errors.root.message}</p>
      )}
    </section>
  );
}
