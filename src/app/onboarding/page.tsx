'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth0 } from '@auth0/auth0-react'
import StoryInput from '@/components/StoryInput'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch'
import { Brain, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function OnboardingPage() {
  const router = useRouter()
  const { loginWithPopup, isAuthenticated } = useAuth0()
  const authenticatedFetch = useAuthenticatedFetch()

  const handleSignIn = async () => {
    try {
      localStorage.setItem('demoMode', 'False')
      await loginWithPopup({
        authorizationParams: {
          screen_hint: 'signin',
        },
      })
      router.push('/home')
    } catch (error) {
      console.error('Error during sign in:', error)
      alert('Failed to sign in. Please try again.')
    }
  }

  const handleDemoMode = async () => {
    try {
      localStorage.setItem('demoMode', 'True')
      await handleSignIn()
    } catch (error) {
      console.error('Error during demo mode sign in:', error)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      const checkUserStory = async () => {
        try {
          const response = await authenticatedFetch('/api/check-story')
          const { hasStory } = await response.json()

          if (hasStory) {
            router.push('/home')
          }
        } catch (error) {
          console.error('Error checking user story:', error)
        }
      }

      checkUserStory()
    }
  }, [isAuthenticated, authenticatedFetch, router])

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-purple-50 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm px-4 lg:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center transition-all duration-300 hover:scale-105 hover:rotate-3">
          <Brain className="h-7 w-7 text-purple-600 animate-pulse" />
          <span className="ml-2 text-xl font-bold text-purple-600 tracking-tight">neuro86</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="container mx-auto py-8 px-4">
          <div className="max-w-4xl mx-auto">
            {/* Sign In Section */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8 text-center">
              <p className="text-gray-900 mb-4">
                Already shared your story with us?
              </p>
              <div className="space-y-4">
                <button
                  onClick={handleSignIn}
                  className="w-full bg-purple-100 text-purple-600 rounded-lg p-3 hover:bg-purple-200 transition-all duration-300 ease-in-out hover:scale-105 flex items-center justify-center gap-2 font-medium"
                >
                  Sign In <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  onClick={handleDemoMode}
                  className="w-full bg-purple-100 text-purple-600 rounded-lg p-3 hover:bg-purple-200 transition-all duration-300 ease-in-out hover:scale-105 flex items-center justify-center gap-2 font-medium"
                >
                  Try Demo Mode <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Story Input Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Share Your Story</h2>
              <ErrorBoundary>
                <StoryInput redirectPath="/home" />
              </ErrorBoundary>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}