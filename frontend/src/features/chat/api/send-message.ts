import { useMutation } from '@tanstack/react-query'
import type { SendMessageDto } from '../../../../../backend/restapi-macroservice/src/domain/models/send-message.dto'
import { getBackendUrl } from '@/lib/backend-url'

export function sendMessage(data: SendMessageDto) {
  return fetch(`${getBackendUrl()}/restapi/send-message`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
}

export function useSendMessage() {
  return useMutation({
    mutationFn: sendMessage,
  })
}
