import type { ChatState } from '../types'

export function NonChatIndicator({
  state,
}: {
  state: Extract<
    ChatState,
    {
      type:
        | 'stalking-started'
        | 'stalking-completed'
        | 'gift-ready'
        | 'chat-interview-completed'
        | 'chat-inappropriate-request'
    } // not chatting
  >
}) {
  if (state.type === 'gift-ready') {
    return (
      <div>
        <>
          <div>Gift ready</div>
          <div>Gift ideas: {state.data.giftIdeas.join(', ')}</div>
        </>
      </div>
    )
  }

  if (state.type === 'chat-inappropriate-request') {
    return (
      <div>
        <div>
          Chat inappropriate request was detected !!! {state.data.reason}
        </div>
      </div>
    )
  }
  return (
    <div>
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        {state.type === 'stalking-started' && <div>Stalking started...</div>}
        {state.type === 'stalking-completed' && (
          <div>Stalking completed. Interview is starting...</div>
        )}
        {state.type === 'chat-interview-completed' && (
          <div>Chat interview completed. Waiting for gift ideas...</div>
        )}
      </div>
    </div>
  )
}
