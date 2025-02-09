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

    let body;
    try {
      body = await req.json();
    } catch (jsonError) {
      console.error('Error parsing JSON:', jsonError);
      return NextResponse.json(
        { error: 'Invalid JSON input' },
        { status: 400 }
      );
    }
    
    const { story } = body;

    if (!story) {
      return NextResponse.json(
        { error: 'Story content is required' },
        { status: 400 }
      );
    }

    // Process story and create timeline
    const timelineJson = await processStoryToTimeline(story);
    if (!timelineJson) {
      console.error('Failed to generate timeline');
      return NextResponse.json(
        { error: 'Failed to generate timeline' },
        { status: 500 }
      );
    }

    const embedding = await generateEmbedding(story);
    if (!embedding) {
      console.error('Failed to generate embedding');
      return NextResponse.json(
        { error: 'Failed to generate embedding' },
        { status: 500 }
      );
    }

    const title = await generateTitle(story);
    if (!title) {
      console.error('Failed to generate title');
      return NextResponse.json(
        { error: 'Failed to generate title' },
        { status: 500 }
      );
    }

    // Create story in database
    const response = await createStory(user.id, title, story, timelineJson, embedding)

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
