'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'
import { useAuth0 } from '@auth0/auth0-react'
import StoryInput from '@/components/StoryInput'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch'
import { useDemoContext } from '@/context/context';

export default function OnboardingPage() {
  const router = useRouter()
  const { loginWithPopup } = useAuth0()
  const authenticatedFetch = useAuthenticatedFetch()
  const [preFilledStory, setPreFilledStory] = useState<string | null>(null); // State for pre-filled story
  const { setDemo } = useDemoContext();

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

  const handlePreFill = async () => {
    const storyText = `So, they found a 2.8cm likely meningioma (on my left side, just above and behind my temple), incidentally at the ER last week when I went in for left sided numbness and hearing/vision issues, which they say are unrelated. I don't have headaches or any other obvious symptoms from it, though it sure looks creepy on the MRI taking up my brain like that.
    Since then, I have seen my PCP, and two neurosurgeons. My PCP and the neurosurgeon at the university of washington both want to take the wait and see approach and do another MRI in May. They say it might be from hormones and once I go through menopause it will stop growing.
    The second neurosurgeon I saw in bellevue says to have the surgery, take it out while I'm young before it causes me problems. That my brain and recovery time will all do better now at age a healthy 44, rather than when I get older and it gets calcified or more attached to my brain and THEN causes me problems. It is fairly large and doesn't have a lot of room to go before he suspects I will have problems.
    The second surgeon has done lots of surgeries, and I really liked him, but he isn't at a world class institution, but operates at a large suburban hospital. He looks to be in his late 30s, early 40s. How important is it to do this at a more innovative center?`;
    try {
      // Submit the pre-filled story
      await authenticatedFetch('/api/submit-story', {
        method: 'POST',
        body: JSON.stringify({ story: storyText }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Redirect to the next page after successful submission
      router.push('/home');
    } catch (error) {
      console.error('Error submitting story:', error);
      alert('Failed to submit the story. Please try again.');
    }
  };

  const handleDemo = () => {
    try {
      setDemo(true);
      router.push('/home');
    } catch (error) {
      console.error('Error setting demo:', error);
      alert('Failed to set demo. Please try again.');
    }
  }

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
            <button
              onClick={() => handleDemo()} 
              className="mt-4 text-blue-600 hover:text-blue-800 font-medium underline"
            >
              Demo Mode
            </button>
          </div>
          <ErrorBoundary>
            <StoryInput redirectPath="/home" />
          </ErrorBoundary>
        </div>
      </main>
  );
}
