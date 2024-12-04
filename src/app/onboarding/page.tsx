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
  const demoMode = typeof window !== 'undefined' && localStorage.getItem('demoMode') === 'True'

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
      router.push('/home')
    } catch (error) {
      console.error('Error during demo mode activation:', error)
    }
  }

  useEffect(() => {
    if (isAuthenticated || demoMode) {
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
  }, [isAuthenticated, demoMode, authenticatedFetch, router])

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm px-4 lg:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center transition-all duration-300 hover:scale-105 hover:rotate-3">
          <Brain className="h-7 w-7 text-purple-600 animate-pulse" />
          <span className="ml-2 text-xl font-bold text-purple-600 tracking-tight">neuro86</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 bg-gradient-to-b from-white to-purple-50">
        <div className="container mx-auto py-12 px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to neuro86</h2>
              <p className="text-lg text-gray-700 mb-6">Share your story to unlock personalized insights powered by AI.</p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={handleSignIn}
                  className="bg-purple-600 text-white rounded-full px-6 py-3 hover:bg-purple-700 transition ease-in-out duration-300 font-medium"
                >
                  Sign In
                </button>
                <button
                  onClick={handleDemoMode}
                  className="bg-gray-300 text-gray-800 rounded-full px-6 py-3 hover:bg-gray-400 transition ease-in-out duration-300 font-medium"
                >
                  Try Demo Mode
                </button>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Share Your Story</h3>
              <p className="text-md text-gray-600 mb-6">Tell us about your experiences, and we'll provide insights tailored to you.</p>
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