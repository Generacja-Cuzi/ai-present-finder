import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export function HomeView() {
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
          <Button size="lg" className="w-full" asChild>
            <Link to="/chat">Start →</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
