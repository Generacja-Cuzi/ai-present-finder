import { SseProviderWrapper } from '../components/sse-provider'
import { ChatUI } from '../components/chat-ui'

export function ChatView({ clientId }: { clientId: string }) {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          AI Present Finder - Chat
        </h1>
        <SseProviderWrapper clientId={clientId}>
          <ChatUI clientId={clientId} />
        </SseProviderWrapper>
      </div>
    </div>
  )
}
