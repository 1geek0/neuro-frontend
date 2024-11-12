import { NextRequest, NextResponse } from 'next/server'
import prisma, { findSimilarStories } from '@/lib/db'

export async function GET(req: NextRequest) {
    try {
        const auth0Id = req.headers.get('x-auth-user-id')
        if (!auth0Id) {
            return NextResponse.json([])
        }

        const user = await prisma.user.findUnique({
            where: { auth0Id }
        })

        if (!user) {
            return NextResponse.json([])
        }

        const userStory = await prisma.story.findFirst({
            where: { userId: user.id }
        })

        if (!userStory?.embedding) {
            return NextResponse.json([])
        }

        const similarStories = await findSimilarStories(userStory.embedding)
        return NextResponse.json(similarStories)
    } catch (error) {
        console.error('Error fetching similar stories:', error)
        return NextResponse.json({ error: 'Failed to fetch similar stories' }, { status: 500 })
    }
} 