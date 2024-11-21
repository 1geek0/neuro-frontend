import { NextRequest, NextResponse } from 'next/server'
import { getOrCreateUser } from '@/lib/db'
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

    const { story } = await req.json()

    if (!story || typeof story !== 'string') {
      return NextResponse.json(
        { error: 'Invalid story format' },
        { status: 400 }
      )
    }

    const sessionId = req.cookies.get('sessionId')?.value

    const { user, sessionId: newSessionId } = await getOrCreateUser(
      sessionId,
      auth0Id,
      username || undefined
    )

    // Process the story with proper error handling
    try {
      const [embedding, title] = await Promise.all([
        generateEmbedding(story),
        generateTitle(story)
      ])

      // Get all user's stories
      const existingStories = await prisma.story.findMany({
        where: { userId: user.id },
        select: { rawText: true }
      })

      // Combine all stories including the new one
      const allStories = [...existingStories.map(s => s.rawText), story]
      const combinedText = allStories.join('\n\n')

      // Generate timeline from combined stories
      const timelineJson = await processStoryToTimeline(combinedText)

      // Save to database
      await prisma.story.create({
        data: {
          userId: user.id,
          title,
          rawText: story,
          embedding,
          timelineJson
        }
      })

      await prisma.user.update({
        where: { id: user.id },
        data: { timelineJson }
      })

      const response = NextResponse.json({ success: true })

      if (!sessionId) {
        response.cookies.set('sessionId', newSessionId, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 365 // 1 year
        })
      }

      return response
    } catch (error) {
      console.error('Error processing story:', error)
      return NextResponse.json(
        { error: 'Failed to process story' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error in story endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
