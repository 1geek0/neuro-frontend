
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth0 } from '@auth0/auth0-react'
import StoryInput from '@/components/StoryInput'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch'

export default function OnboardingPage() {
  const router = useRouter()
  const { loginWithPopup } = useAuth0()
  const authenticatedFetch = useAuthenticatedFetch()

  const handleSignIn = async () => {
    try {
      // Trigger Auth0 login
      await loginWithPopup({
        authorizationParams: {
          screen_hint: 'signin',
        }
      });

      // After successful Auth0 login, check if user has a story
      const response = await authenticatedFetch('/api/check-story');
      const { hasStory } = await response.json();

      if (hasStory) {
        router.push('/home');
      }
    } catch (error) {
      console.error('Error during sign in:', error);
      alert('Failed to sign in. Please try again.');
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <p className="text-gray-600">
            Already shared your story with us?{' '}
            <button
              onClick={handleSignIn}
              className="text-blue-600 hover:text-blue-800 font-medium underline"
            >
              Sign in here
            </button>
          </p>
        </div>
        <ErrorBoundary>
          <StoryInput redirectPath="/home" />
        </ErrorBoundary>
      </div>
    </main>
  );
}