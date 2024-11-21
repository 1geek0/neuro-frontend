import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/db";
import prisma from '@/lib/db'
import { error } from "console";

interface Event {
  phase: string;
  type: string;
  date: string; // ISO date string
  desc: string[]; // Array of strings for descriptions
}

export async function GET(req : NextRequest) {
  try {
    const auth0Id = req.headers.get('x-auth-user-id')

    if(!auth0Id) {
      return NextResponse.json(
        {error : 'Unauthorized'},
        {status : 411 }
      )
    }


    const sessionId = req.cookies.get("sessionId")?.value;
    const { user } = await getOrCreateUser(sessionId, auth0Id);
    const timeline = user?.timelineJson?.events as Event;
    return NextResponse.json({
      timeline : timeline
    });
  } catch (error) {
    console.error("Error checking story status:", error);
    return NextResponse.json(
      { error: "Failed to check story status 1" },
      { status: 500 }
    );
  }
}