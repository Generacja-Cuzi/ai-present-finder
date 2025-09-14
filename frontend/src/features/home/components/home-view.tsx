import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { useStalkingRequestMutation } from '../api/stalking-request'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export function HomeView() {
  const navigate = useNavigate()
  const stalkingRequestMutation = useStalkingRequestMutation()

  const handleStart = async () => {
    try {
      // TODO(simon-the-shark): someone needs to add this later
      await stalkingRequestMutation.mutateAsync(
        {
          facebookUrl: '',
          instagramUrl: '',
          tiktokUrl: '',
          youtubeUrl: '',
          xUrl: '',
          linkedinUrl: '',
        },
        {
          onSuccess: () => {
            navigate({ to: '/chat' })
          },
        },
      )
    } catch (error) {
      console.error('Failed to start:', error)
      toast.error('Failed to start gift search. Please try again.', {
        id: 'stalking-request',
        dismissible: true,
      })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white">
            Hello! 👋
          </CardTitle>
          <CardDescription className="text-lg text-gray-600 dark:text-gray-300">
            Welcome to AI Present Finder
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Let's help you find the perfect gift for your loved ones!
          </p>
          <Button
            size="lg"
            className="w-full"
            onClick={handleStart}
            disabled={stalkingRequestMutation.isPending}
          >
            {stalkingRequestMutation.isPending ? 'Starting...' : 'Start →'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
