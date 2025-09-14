import React from 'react'
import { SSEProvider } from 'react-hooks-sse'

interface SseProviderWrapperProps {
  children: React.ReactNode
  clientId: string
}

export const SseProviderWrapper: React.FC<SseProviderWrapperProps> = ({
  children,
  clientId,
}) => {
  // Get the base URL from environment or use localhost for development
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
  const sseEndpoint = `${baseUrl}/sse?clientId=${clientId}`

  return <SSEProvider endpoint={sseEndpoint}>{children}</SSEProvider>
}
