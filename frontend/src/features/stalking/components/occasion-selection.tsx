import { useFormContext } from "react-hook-form";

import { OccasionCard } from "../components";
import type { StalkingFormData } from "../types";

export function OccasionSelector() {
  const { watch, setValue, formState } = useFormContext<StalkingFormData>();
  const selectedOccasion = watch("occasion");

  return (
    <section className="mb-8">
      <h2 className="text-foreground mb-2 text-xl font-bold">
        Gift Parameters
      </h2>
      <p className="mb-4 text-base text-gray-500">What&apos;s the occasion?</p>

      <div className="grid grid-cols-2 gap-4">
        {(["birthday", "anniversary", "holiday", "just-because"] as const).map(
          (o) => (
            <OccasionCard
              key={o}
              occasion={o}
              selected={selectedOccasion === o}
              onSelect={() => {
                setValue("occasion", o, {
                  shouldValidate: true,
                });
              }}
            />
          ),
        )}
      </div>

      {Boolean(formState.errors.occasion) && (
        <p className="mt-2 text-sm text-red-500">
          {formState.errors.occasion?.message ?? "Please select an occasion"}
        </p>
      )}
    </section>
  );
}
