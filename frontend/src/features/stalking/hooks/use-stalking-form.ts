import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { stalkingFormSchema } from "../types";
import type { StalkingFormData } from "../types";

export function useStalkingForm() {
  return useForm<StalkingFormData>({
    resolver: zodResolver(stalkingFormSchema),
    mode: "onChange",
    defaultValues: {
      instagramUrl: "",
      xUrl: "",
      tiktokUrl: "",
      occasion: undefined,
    },
  });
}
