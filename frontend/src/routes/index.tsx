import { createFileRoute } from '@tanstack/react-router'
import { SseDemo } from '../components/SseDemo'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          AI Present Finder - SSE Demo
        </h1>
        <SseDemo />
      </div>
    </div>
  )
}
