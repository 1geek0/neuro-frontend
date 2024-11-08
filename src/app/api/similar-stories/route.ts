import { NextRequest, NextResponse } from 'next/server'
import prisma, { findSimilarStories } from '@/lib/db'
import { getOrCreateUser } from '@/lib/db'

export async function GET(req: NextRequest) {
    try {
        const sessionId = req.cookies.get('sessionId')?.value
        if (!sessionId) {
            return NextResponse.json([])
        }

        const { user } = await getOrCreateUser(sessionId)
        const userStory = await prisma.story.findFirst({
            where: { userId: user.id }
        })

        if (!userStory?.embedding) {
            return NextResponse.json([])
        }
        // Find similar stories using vector similarity
        const similarStories = await findSimilarStories(userStory.embedding)

        return NextResponse.json(similarStories)
    } catch (error) {
        console.error('Error fetching similar stories:', error)
        return NextResponse.json({ error: 'Failed to fetch similar stories' }, { status: 500 })
    }
} 