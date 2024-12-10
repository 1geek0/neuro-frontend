'use client'

import React, { useState } from 'react'
import { Mic, MicOff, Loader2, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth0 } from '@auth0/auth0-react'
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch'

interface StoryInputProps {
  redirectPath: string;
  defaultValue?: string;
}

export default function StoryInput({ redirectPath, defaultValue }: StoryInputProps)  {
  const [story, setStory] = useState<string>(defaultValue || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { loginWithPopup, isAuthenticated, isLoading, getAccessTokenSilently, getIdTokenClaims } = useAuth0()
  const authenticatedFetch = useAuthenticatedFetch()

  const handleSubmit = async () => {
    if (!story.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);

      if (!isAuthenticated) {
        await loginWithPopup({
          authorizationParams: {
            screen_hint: 'signup',
          }
        });
      }

      const response = await authenticatedFetch('/api/story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ story }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit story');
      }

      router.push(redirectPath);
    } catch (error) {
      console.error('Error submitting story:', error)
      alert('Failed to submit story. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isButtonDisabled = !story.trim() || isSubmitting || isLoading;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-center mb-8 text-black">
        Can you tell us about your experience with meningioma?
      </h1>

      <div className="relative">
        <textarea
          value={story}
          onChange={(e) => setStory(e.target.value)}
          placeholder="I was diagnosed with a meningioma in [year]. Here's what happened:
The first symptoms I noticed were...
My doctor ordered these tests...
I had surgery on [date]. The type of surgery was...
After the surgery, I experienced...
My current medications include...
Some background about my overall health:
What I've learned from this experience:
Advice I'd give to others facing a similar diagnosis:"
          className="w-full h-64 p-4 border rounded-lg resize-none bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200"
        />
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={isButtonDisabled}
          className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 ease-in-out ${
            isButtonDisabled
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-purple-100 text-purple-600 hover:bg-purple-200 hover:scale-105'
          }`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  )
}
