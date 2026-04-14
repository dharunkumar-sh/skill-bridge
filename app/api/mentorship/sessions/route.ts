import { NextResponse } from 'next/server';
import { db } from '@/src/db';
import { mentorshipSessions, users } from '@/src/db/schema';
import { eq, desc } from 'drizzle-orm';

// GET all sessions for a user
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const userResult = await db.select().from(users).where(eq(users.email, email));
    if (userResult.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userId = userResult[0].id;

    const sessions = await db
      .select()
      .from(mentorshipSessions)
      .where(eq(mentorshipSessions.userId, userId))
      .orderBy(desc(mentorshipSessions.lastActiveAt));

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Error fetching mentorship sessions:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST create a new session
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, mentorName, mentorRole, mentorAvatar, topic } = body;

    if (!email || !mentorName || !mentorRole || !mentorAvatar || !topic) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const userResult = await db.select().from(users).where(eq(users.email, email));
    if (userResult.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userId = userResult[0].id;

    const newSession = await db.insert(mentorshipSessions).values({
      userId,
      mentorName,
      mentorRole,
      mentorAvatar,
      topic,
    }).returning();

    return NextResponse.json({ session: newSession[0] }, { status: 201 });
  } catch (error) {
    console.error('Error creating mentorship session:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
