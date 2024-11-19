import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import StoryInput from '@/components/StoryInput';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const resolvedParams = await params;
  try {
    const auth0Id = request.headers.get('x-auth-user-id');
    if (!auth0Id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { rawText } = await request.json();
    if (!rawText) {
      return NextResponse.json(
        { error: 'Raw text is required' },
        { status: 400 }
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

    const updatedStory = await prisma.story.updateMany({
      where: {
        id: resolvedParams.id,
        userId: user.id
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