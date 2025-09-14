import type { ChatState } from '../types'

export function NonChatIndicator({
  state,
}: {
  state: Extract<
    ChatState,
    { type: 'stalking-started' | 'stalking-completed' | 'gift-ready' } // not chatting
  >
}) {
  return (
    <div>
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        {state.type === 'stalking-started' && <div>Stalking started</div>}
        {state.type === 'stalking-completed' && <div>Stalking completed</div>}
        {state.type === 'gift-ready' && <div>Gift ready</div>}
      </div>
    </div>
  )
}
