import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth0Id = req.headers.get('x-auth-user-id');
    if (!auth0Id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { rawText } = await req.json();
    if (!rawText) {
      return NextResponse.json(
        { error: 'Raw text is required' },
        { status: 400 }
      );
    }

    // Get user to verify ownership
    const user = await prisma.user.findUnique({
      where: { auth0Id }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update the story
    const updatedStory = await prisma.story.updateMany({
      where: {
        id: params.id,
        userId: user.id // Ensure user owns the story
      },
      data: {
        rawText,
        updatedAt: new Date()
      }
    });

    if (!updatedStory.count) {
      return NextResponse.json(
        { error: 'Story not found or unauthorized' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating story:', error);
    return NextResponse.json(
      { error: 'Failed to update story' },
      { status: 500 }
    );
  }
} 