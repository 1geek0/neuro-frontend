import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET(req: NextRequest) {
    try {
        const auth0Id = req.headers.get('x-auth-user-id')
        if (!auth0Id) {
            return NextResponse.json({ hasStory: false })
        }

        const user = await prisma.user.findUnique({
            where: { auth0Id }
        })

        if (!user) {
            return NextResponse.json({ hasStory: false })
        }

        const story = await prisma.story.findFirst({
            where: { userId: user.id }
        })

        return NextResponse.json({ hasStory: !!story })
    } catch (error) {
        console.error('Error checking story status:', error)
        return NextResponse.json(
            { error: 'Failed to check story status 2' },
            { status: 500 }
        )
    }
} 