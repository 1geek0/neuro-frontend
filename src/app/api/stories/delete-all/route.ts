import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function DELETE(req: NextRequest) {
    try {
        const auth0Id = req.headers.get('x-auth-user-id');
        if (!auth0Id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { auth0Id }
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Delete all stories for the user
        await prisma.story.deleteMany({
            where: { userId: user.id }
        });

        // Reset user's timeline
        await prisma.user.update({
            where: { id: user.id },
            data: { timelineJson: null }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting stories:', error);
        return NextResponse.json(
            { error: 'Failed to delete stories' },
            { status: 500 }
        );
    }
} 