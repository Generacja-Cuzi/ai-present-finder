import { useSSE } from 'react-hooks-sse'
import { useMemo } from 'react'

type SseState = string | null

type SseAction = string

export const useSseChat = ({
  clientId,
  eventName = 'message',
}: {
  clientId: string
  eventName: string
}) => {
  const initialState: SseState = useMemo(() => null, [])

  const state = useSSE<SseState, SseAction>(eventName, initialState, {
    parser: (data: string) => {
      return data
    },
    stateReducer: (_, action) => {
      return action.data
    },
  })

  return {
    message: state,
    clientId,
  }
}
