export const SSE_EVENTS = {
  UI_UPDATE: "ui-update",
} as const;

export type SseEventType = (typeof SSE_EVENTS)[keyof typeof SSE_EVENTS];

export interface BaseSseMessage<T = unknown> {
  type: string;
  data?: T;
}

export interface UseSseOptions<TState, TMessage> {
  stateReducer: (previousState: TState, action: { data: TMessage }) => TState;

  messageFilter?: (message: TMessage) => boolean;
}
