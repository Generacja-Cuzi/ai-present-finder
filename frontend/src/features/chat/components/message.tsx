import type { UIChatMessage } from '../types'

export function Message({ message }: { message: UIChatMessage }) {
  return (
    <div
      key={message.id}
      className={`flex ${
        message.sender === 'user' ? 'justify-end' : 'justify-start'
      }`}
    >
      <div
        className={`max-w-[80%] rounded-lg px-3 py-2 ${
          message.sender === 'user'
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted'
        }`}
      >
        <p className="text-sm">{message.content}</p>
      </div>
    </div>
  )
}
