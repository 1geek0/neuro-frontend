'use client'

import { useState } from 'react'
import { Mic, MicOff, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth0 } from '@auth0/auth0-react'
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch'

export default function StoryInput() {
  const [story, setStory] = useState('')
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

      router.push('/home');
    } catch (error) {
      console.error('Error submitting story:', error)
      alert('Failed to submit story. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isButtonDisabled = !story.trim() || isSubmitting || isLoading;

  return (
    <div className="w-full max-w-3xl mx-auto p-4 space-y-4">
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
          className="w-full h-64 p-4 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 text-black"
        />
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={isButtonDisabled}
          className={`px-6 py-2 rounded-lg text-white font-medium
            ${isButtonDisabled
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-500 hover:bg-green-600'}`}
        >
          {isSubmitting ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Processing...</span>
            </div>
          ) : (
            <span>Next</span>
          )}
        </button>
      </div>
    </div>
  )
}
