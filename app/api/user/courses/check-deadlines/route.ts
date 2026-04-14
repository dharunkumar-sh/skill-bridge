import { NextResponse } from 'next/server';
import { db } from '@/src/db';
import { userCourses, users } from '@/src/db/schema';
import { eq, and, lt, not, isNull } from 'drizzle-orm';

// GET - Check for courses that have passed their deadline and need a status prompt
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Get user ID
    const userResult = await db.select().from(users).where(eq(users.email, email));
    if (userResult.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userId = userResult[0].id;
    const now = new Date();

    // Find courses that:
    // 1. Belong to this user
    // 2. Have a deadline in the past
    // 3. Are NOT completed or skipped
    // 4. Haven't been prompted in the last 24 hours (to avoid nagging)
    const overdueCourses = await db
      .select()
      .from(userCourses)
      .where(
        and(
          eq(userCourses.userId, userId),
          lt(userCourses.deadlineAt, now),
          not(eq(userCourses.status, 'completed')),
          not(eq(userCourses.status, 'skipped'))
        )
      );

    // Filter out courses that were prompted less than 24 hours ago
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const coursesNeedingPrompt = overdueCourses.filter(course => {
      if (!course.promptedAt) return true;
      return new Date(course.promptedAt) < oneDayAgo;
    });

    return NextResponse.json({ 
      overdueCourses: coursesNeedingPrompt,
      totalOverdue: overdueCourses.length,
    });
  } catch (error) {
    console.error('Error checking deadlines:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
