'use client'

import { useRouter } from 'next/navigation'
import { useAuthRedirect } from '@/hooks/useAuthRedirect'
import StoryInput from '@/components/StoryInput'
import { ErrorBoundary } from '@/components/ErrorBoundary'

export default function AddStoryPage() {
  useAuthRedirect();
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Notes
          </button>
        </div>
        <ErrorBoundary>
          <StoryInput redirectPath="/notes" />
        </ErrorBoundary>
      </div>
    </main>
  );
} 