import { NextRequest, NextResponse } from 'next/server'
import { getOrCreateUser } from '@/lib/db'
import prisma from '@/lib/db'

export async function GET(req: NextRequest) {
    try {
        const sessionId = req.cookies.get('sessionId')?.value
        if (!sessionId) {
            return NextResponse.json({ hasStory: false })
        }

        const { user } = await getOrCreateUser(sessionId)
        const story = await prisma.story.findFirst({
            where: { userId: user.id }
        })

        return NextResponse.json({ hasStory: !!story })
    } catch (error) {
        console.error('Error checking story status:', error)
        return NextResponse.json(
            { error: 'Failed to check story status' },
            { status: 500 }
        )
    }
} 