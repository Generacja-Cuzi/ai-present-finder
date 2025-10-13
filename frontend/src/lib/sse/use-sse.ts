import { useMemo } from "react";
import { useSSE as useReactHooksSSE } from "react-hooks-sse";

import type { UseSseOptions } from "./types";

/**
 * Generic SSE hook that can be used across multiple features.
 *
 * @template TState - The state type managed by this hook
 * @template TMessage - The SSE message type this hook handles
 *
 * @param eventName - The SSE event name to listen to
 * @param initialState - Initial state value
 * @param options - Configuration options including state reducer
 *
 * @example
 * ```tsx
 * const state = useSse<ChatState, ChatSseMessage>(
 *   'ui-update',
 *   { type: 'idle' },
 *   {
 *     stateReducer: (prev, action) => {
 *       // Handle state updates
 *       return newState;
 *     }
 *   }
 * );
 * ```
 */
export function useSse<TState, TMessage>(
  eventName: string,
  initialState: TState,
  options: UseSseOptions<TState, TMessage>,
): TState {
  // Note: We expect initialState to be stable (e.g., created with useMemo in the calling code)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoizedInitialState = useMemo(() => initialState, []);

  const state = useReactHooksSSE<TState, TMessage>(
    eventName,
    memoizedInitialState,
    {
      stateReducer: options.stateReducer,
    },
  );

  return state;
}
