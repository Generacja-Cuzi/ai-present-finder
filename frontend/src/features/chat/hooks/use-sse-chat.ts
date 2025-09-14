import { useSSE } from 'react-hooks-sse'
import { useMemo } from 'react'
import { uiUpdateEvent } from '../types'
import type { ChatState, SseMessageDto } from '../types'

export const useSseChat = ({ clientId }: { clientId: string }) => {
  const initialState: ChatState = useMemo(
    () => ({ type: 'stalking-started' }),
    [],
  )

  const state = useSSE<ChatState, SseMessageDto>(
    uiUpdateEvent,
    initialState,

    {
      stateReducer: (prevState, action) => {
        switch (action.data.type) {
          case 'stalking-started':
            return { type: 'stalking-started' }
          case 'stalking-completed':
            return { type: 'stalking-completed' }
          case 'chatbot-message': {
            if (prevState.type !== 'chatting') {
              return {
                type: 'chatting',
                data: {
                  messages: [action.data.message],
                },
              }
            }
            return {
              type: 'chatting',
              data: {
                messages: [...prevState.data.messages, action.data.message],
              },
            }
          }
          case 'gift-ready':
            return {
              type: 'gift-ready',
              data: { giftIdeas: action.data.data.giftIdeas },
            }
        }
      },
    },
  )

  return {
    state,
    clientId,
  }
}
