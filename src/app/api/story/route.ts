import { NextRequest, NextResponse } from 'next/server'
import { getOrCreateUser, createStory } from '@/lib/db'
import { generateEmbedding, processStoryToTimeline, generateTitle } from '@/lib/embeddings'
import prisma from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const auth0Id = req.headers.get('x-auth-user-id')
    const username = req.headers.get('x-auth-username')

    if (!auth0Id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const sessionId = req.cookies.get("sessionId")?.value || undefined;
    const { user } = await getOrCreateUser(sessionId, auth0Id, username || undefined);

    const body = await req.json()
    const { story } = body

    if (!story) {
      return NextResponse.json(
        { error: 'Story content is required' },
        { status: 400 }
      )
    }

    // Process story and create timeline
    const timelineJson = await processStoryToTimeline(story)
    const embedding = await generateEmbedding(story)

    // Create story in database
    const response = await createStory(user.id, story, timelineJson, embedding)
    
    if (!response) {
      throw new Error('Failed to create story')
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error processing story:', error)
    return NextResponse.json(
      { error: 'Failed to process story' },
      { status: 500 }
    )
  }
}
