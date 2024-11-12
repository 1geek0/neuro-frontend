import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0'

export const GET = withApiAuthRequired(async function linkUser(req: NextRequest) {
    try {
        const sessionId = req.cookies.get('sessionId')?.value
        if (!sessionId) {
            return NextResponse.json({ error: 'No session ID found' }, { status: 400 })
        }

        const session = await getSession()
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Update the user record with Auth0 information
        const updatedUser = await prisma.user.update({
            where: { sessionId },
            data: {
                auth0Id: session.user.sub,
                username: session.user.nickname || session.user.name
            }
        })

        return NextResponse.json({ success: true, user: updatedUser })
    } catch (error) {
        console.error('Error linking user:', error)
        return NextResponse.json(
            { error: 'Failed to link user' },
            { status: 500 }
        )
    }
})

// Alias POST to the same handler
export const POST = GET 