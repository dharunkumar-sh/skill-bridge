import { NextResponse } from 'next/server';
import { db } from '@/src/db';
import { users } from '@/src/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, mindset, skillStatus, careerGoal } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const updatedUsers = await db.update(users)
      .set({
        mindset,
        skillStatus,
        careerGoal,
        hasCompletedOnboarding: true,
      })
      .where(eq(users.email, email))
      .returning();

    if (updatedUsers.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user: updatedUsers[0] });
  } catch (error) {
    console.error('Error in Onboarding API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
