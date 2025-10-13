import { useSSE as useReactHooksSSE } from "react-hooks-sse";

import type { UseSseOptions } from "./types";

export function useSse<TState, TMessage>(
  eventName: string,
  initialState: TState,
  options: UseSseOptions<TState, TMessage>,
): TState {
  return useReactHooksSSE<TState, TMessage>(eventName, initialState, {
    stateReducer: options.stateReducer,
  });
}
