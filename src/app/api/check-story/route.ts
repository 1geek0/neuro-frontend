import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/db";
import prisma from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const auth0Id = req.headers.get("x-auth-user-id");

    if (!auth0Id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sessionId = req.cookies.get("sessionId")?.value;
    const { user } = await getOrCreateUser(sessionId, auth0Id);

    const story = await prisma.story.findFirst({
      where: { userId: user.id },
    });

    return NextResponse.json({ hasStory: !!story });
  } catch (error) {
    console.error("Error checking story status:", error);
    return NextResponse.json(
      { error: "Failed to check story status 1" },
      { status: 500 }
    );
  }
}
