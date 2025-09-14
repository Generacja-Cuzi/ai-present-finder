import { createFileRoute } from '@tanstack/react-router'
import { ChatView } from '../features/chat/components/chat-view'

export const Route = createFileRoute('/chat')({
  component: ChatPage,
})

function ChatPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          AI Present Finder - Chat
        </h1>
        <ChatView />
      </div>
    </div>
  )
}
