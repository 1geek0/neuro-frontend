'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import StoryInput from '@/components/StoryInput'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Suspense } from 'react'

export default function OnboardingPage() {
  const router = useRouter()

  useEffect(() => {
    const checkStoryStatus = async () => {
      try {
        const response = await fetch('/api/check-story')
        const { hasStory } = await response.json()

        if (hasStory) {
          router.push('/home')
        }
      } catch (error) {
        console.error('Error checking story status:', error)
      }
    }

    checkStoryStatus()
  }, [router])

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto py-8">
        <ErrorBoundary>
          <Suspense fallback={
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
            </div>
          }>
            <StoryInput />
          </Suspense>
        </ErrorBoundary>
      </div>
    </main>
  )
}
