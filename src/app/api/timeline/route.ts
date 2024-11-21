import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/db";
import { processStoryToTimeline } from "@/lib/embeddings";
import prisma from '@/lib/db';

interface TimelineEvent {
  phase: string;
  type: string;
  date: string;
  desc: string[];
  details?: string;
}

export async function GET(req: NextRequest) {
  try {
    const auth0Id = req.headers.get('x-auth-user-id')

    if (!auth0Id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const sessionId = req.cookies.get("sessionId")?.value;
    const { user } = await getOrCreateUser(sessionId, auth0Id);

    // If user already has timelineJson with events, return it
    if (typeof user.timelineJson === 'object' && !Array.isArray(user.timelineJson) && user.timelineJson?.events && Array.isArray(user.timelineJson.events)) {
      return NextResponse.json({
        timeline: user.timelineJson.events
      });
    }

    // Otherwise, fetch all user's stories and generate timeline
    const stories = await prisma.story.findMany({
      where: { userId: user.id },
      select: { rawText: true },
      orderBy: { createdAt: 'desc' }
    });

    if (stories.length === 0) {
      return NextResponse.json({ timeline: [] });
    }

    // Combine all stories
    const combinedText = stories.map(s => s.rawText).join('\n\n');

    // Generate new timeline
    const timelineJson = await processStoryToTimeline(combinedText);

    // Validate timeline structure
    if (!timelineJson?.events || !Array.isArray(timelineJson.events)) {
      throw new Error('Invalid timeline format returned from processing');
    }

    // Update user with new timeline
    await prisma.user.update({
      where: { id: user.id },
      data: { timelineJson }
    });

    return NextResponse.json({
      timeline: timelineJson.events
    });
  } catch (error) {
    console.error("Error fetching timeline:", error);
    return NextResponse.json(
      { error: "Failed to fetch timeline" },
      { status: 500 }
    );
  }
}