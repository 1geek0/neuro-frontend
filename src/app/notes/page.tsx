'use client'

import React, { useState, useEffect } from 'react';
import { PencilIcon, PlusCircle, Loader2, ArrowLeft, Lock, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';
import { TimelineModal } from '@/components/TimelineModal';
import { demoSimilarStories } from '@/Demo/demoSimilarStories';
import { TimelineChartModal } from '@/components/TimelineChartModal';

interface Story {
  id: string;
  title: string | null;
  rawText: string;
  createdAt: { $date: string };
}

const StoryNotes = () => {
  useAuthRedirect();
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState('');
  const [showTimeline, setShowTimeline] = useState(false);
  const [showWhoElseTimeline, setShowWhoElseTimeline] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [storyToDelete, setStoryToDelete] = useState<Story | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const authenticatedFetch = useAuthenticatedFetch();
  const [demoMode, setDemoMode] = useState<Boolean>(false);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    if (localStorage.getItem('demoMode') === 'True') {
      setDemoMode(true);
    }

    const loadStories = async () => {
      try {
        const response = await authenticatedFetch('/api/stories');
        if (!response.ok) throw new Error('Failed to fetch stories');
        const data = await response.json();
        const stories = data.map((story: Story) => ({
          ...story,
          createdAt: { $date: story.createdAt }
        }));
        if (mounted) {
          setStories(stories);
        }
      } catch (error) {
        console.error('Error fetching stories:', error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };
    if (localStorage.getItem('demoMode') === 'True') {
      if (mounted) {
        setIsLoading(false);
        setStories(demoSimilarStories)
      }
    } else {
      loadStories();
    }

    return () => {
      mounted = false;
    };
  }, []);

  const handleAddStory = () => {
    router.push('/notes/add');
  };

  const handleEditStory = (story: Story) => {
    setSelectedStory(story);
    setEditedText(story.rawText);
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedStory) return;

    try {
      const response = await authenticatedFetch(`/api/story/${selectedStory.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rawText: editedText }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update story');
      }

      const storiesResponse = await authenticatedFetch('/api/stories');
      if (storiesResponse.ok) {
        const data = await storiesResponse.json();
        setStories(data);
      }

      setIsEditing(false);
      setSelectedStory(null);
    } catch (error) {
      console.error('Error updating story:', error);
      alert('Failed to update story. Please try again.');
    }
  };
  const handleDeleteStory = async (id: string) => {
    setIsDeleting(true);
    try {
      const response = await authenticatedFetch(`/api/story/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete story');
      }

      const storiesResponse = await authenticatedFetch('/api/stories');
      if (storiesResponse.ok) {
        const data = await storiesResponse.json();
        setStories(data);
      }
    } catch (error) {
      console.error('Error deleting story:', error);
      alert('Failed to delete story. Please try again.');
    } finally {
      setIsConfirmingDelete(false);
      setIsDeleting(false);
    }
  };
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-purple-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-blue-100 text-blue-800 p-4 rounded-lg mb-6">
          <p className="text-sm">
            Your stories are always private. You can publish a short summary of your experience to share with others.
          </p>
        </div>

        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/home')}
              className="flex items-center gap-2 px-4 py-2 text-purple-600 hover:text-purple-800 font-medium transition-all duration-300 ease-in-out hover:scale-105"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">My Story Notes</h1>
          </div>
          <div className="flex gap-4">
            {!demoMode &&
              <button
                onClick={() => setShowWhoElseTimeline(true)}
                className="px-4 py-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-all duration-300 ease-in-out hover:scale-105 flex items-center justify-center"
              >
                Who Else
              </button>
            }
            <button
              onClick={() => setShowTimeline(true)}
              className="px-4 py-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-all duration-300 ease-in-out hover:scale-105 flex items-center justify-center"
            >
              View Timeline
            </button>
            {!demoMode &&
              <button
                onClick={handleAddStory}
                className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-all duration-300 ease-in-out hover:scale-105"
              >
                <PlusCircle className="w-5 h-5" />
                Update Story
              </button>
            }
          </div>
        </div>

        <div className="space-y-4">
          {stories.map((story, index) => (
            <div
              key={story.id}
              className="bg-white rounded-lg shadow-sm border p-6 space-y-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-sm text-gray-500 flex items-center">
                    <Lock className="w-4 h-4 text-green-500 mr-1" />
                    Note {index + 1} - {new Date(story.createdAt.$date).toLocaleString()} <span className="text-black-800 text-sm"> ( Private )</span>
                  </span>
                  <h2 className="text-xl font-semibold text-gray-900 mt-1">
                    {story.title ? story.title : `Story ${index + 1}`}
                  </h2>
                </div>
                {!demoMode && <div className="flex gap-3">
                  <button
                    onClick={() => handleEditStory(story)}
                    className="p-1 text-gray-600 hover:text-gray-700 rounded-full hover:bg-gray-100"
                    aria-label="Edit story"
                  >
                    <PencilIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => { setIsConfirmingDelete(true); setStoryToDelete(story) }}
                    className="p-1 text-gray-600 hover:text-red-700 rounded-full hover:bg-gray-100"
                    aria-label="Delete story"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>}
              </div>
              <p className="text-gray-700 whitespace-pre-wrap">{story.rawText}</p>
            </div>
          ))}

          {stories.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg border">
              <p className="text-gray-500">No stories yet. Click on Add New Story to get started.</p>
            </div>
          )}
        </div>
      </div>

      {isEditing && selectedStory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
            <h3 className="text-xl font-semibold mb-4">Edit Story</h3>
            <textarea
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              className="w-full h-64 p-4 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex justify-end gap-4 mt-4">
              <button
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-2 px-4 py-2 text-purple-600 hover:text-purple-800 font-medium transition-all duration-300 ease-in-out hover:scale-105"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-all duration-300 ease-in-out hover:scale-105 flex items-center justify-center"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {isConfirmingDelete && storyToDelete && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4'>
          <div className='bg-white rounded-lg max-w-2xl p-6'>
            {isDeleting ? (
              <div className="text-center py-8">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-purple-500" />
                <p className="text-sm text-gray-500 mt-2">Deleting your story</p>
              </div>
            ) :
              <>
                <h3 className='text-xl font-semibold'>Confirm Delete</h3>
                <p className='text-gray-700 my-4'>Are you sure you want to delete this story?</p>
                <div className='flex w-full justify-end gap-4 mt-4'>
                  <button
                    onClick={() => { setIsConfirmingDelete(false); setStoryToDelete(null) }}
                    className='flex items-center gap-2 px-4 py-2 text-purple-600 hover:text-purple-800 font-medium transition-all duration-300 ease-in-out hover:scale-105'
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      handleDeleteStory(storyToDelete.id);
                    }}
                    className='px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all duration-300 ease-in-out hover:scale-105 flex items-center justify-center'
                  >
                    Delete
                  </button>
                </div>
              </>
            }
          </div>
        </div>
      )}

      <TimelineModal
        isOpen={showTimeline}
        onClose={() => setShowTimeline(false)}
      />
      <TimelineChartModal
        isOpen={showWhoElseTimeline}
        onClose={() => setShowWhoElseTimeline(false)}
      />
    </div>
  );
};

export default StoryNotes; 