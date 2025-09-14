import { useMemo, useState } from 'react'
import { v7 as uuidv7 } from 'uuid'
import { useSseConnection } from '../integrations/sse/use-sse-connection'
import { SseProviderWrapper } from '@/integrations/sse/sse-provider'

export function SseDemo() {
  const clientId = useMemo(() => uuidv7(), [])

  return (
    <SseProviderWrapper clientId={clientId}>
      <SseDemoContent clientId={clientId} />
    </SseProviderWrapper>
  )
}

function SseDemoContent({ clientId }: { clientId: string }) {
  const { message } = useSseConnection({
    clientId,
    eventName: 'message',
  })

  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(clientId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }
  console.log(message)

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        SSE Connection Demo
      </h2>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Client ID:
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={clientId}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            readOnly={true}
          />
          <button
            onClick={handleCopy}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              copied
                ? 'bg-green-500 text-white'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2 text-gray-800">
          Latest Message:
        </h3>
        <div className="bg-gray-100 p-4 rounded-md min-h-[100px]">
          {message ? (
            <pre className="text-sm text-gray-700 whitespace-pre-wrap">
              <code>{message}</code>
            </pre>
          ) : (
            <p className="text-gray-500 italic">No messages received yet...</p>
          )}
        </div>
      </div>
    </div>
  )
}
