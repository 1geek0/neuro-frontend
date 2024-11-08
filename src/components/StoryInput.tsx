'use client'

import { useState, useEffect } from 'react'
import { Mic, MicOff, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function StoryInput() {
  const [story, setStory] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()


  const handleSubmit = async () => {
    if (!story.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true)
      const response = await fetch('/api/story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ story }),
      })

      if (!response.ok) throw new Error('Failed to submit story')

      router.push('/home')
    } catch (error) {
      console.error('Error submitting story:', error)
      alert('Failed to submit story. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold text-center mb-8 text-black">
        Can you tell us about your experience with meningioma?
      </h1>

      <div className="relative">
        <textarea
          value={story}
          onChange={(e) => setStory(e.target.value)}
          placeholder="Share your journey..."
          className="w-full h-64 p-4 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 text-black"
        />

        {/*<button*/}
        {/*  onClick={toggleRecording}*/}
        {/*  className={`absolute bottom-4 right-4 p-2 rounded-full */}
        {/*    ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'}`}*/}
        {/*>*/}
        {/*  {isRecording ? (*/}
        {/*    <MicOff className="w-5 h-5 text-white" />*/}
        {/*  ) : (*/}
        {/*    <Mic className="w-5 h-5 text-white" />*/}
        {/*  )}*/}
        {/*</button>*/}
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={!story.trim() || isSubmitting}
          className={`px-6 py-2 rounded-lg text-white font-medium
            ${isSubmitting || !story.trim()
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
