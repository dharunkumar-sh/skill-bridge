import { NextResponse } from 'next/server';
import { db } from '@/src/db';
import { userCourses, users } from '@/src/db/schema';
import { eq, and } from 'drizzle-orm';

// GET - Fetch all enrolled courses for a user
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Get the user ID from email
    const userResult = await db.select().from(users).where(eq(users.email, email));
    if (userResult.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userId = userResult[0].id;

    const courses = await db
      .select()
      .from(userCourses)
      .where(eq(userCourses.userId, userId))
      .orderBy(userCourses.enrolledAt);

    return NextResponse.json({ courses });
  } catch (error) {
    console.error('Error fetching user courses:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST - Enroll in a course
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, courseTitle, courseUrl, courseSource, courseThumbnail, courseInstructor, priority, durationWeeks } = body;

    if (!email || !courseTitle) {
      return NextResponse.json({ error: 'Email and courseTitle are required' }, { status: 400 });
    }

    // Get the user ID
    const userResult = await db.select().from(users).where(eq(users.email, email));
    if (userResult.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userId = userResult[0].id;

    // Check if already enrolled
    const existing = await db
      .select()
      .from(userCourses)
      .where(and(
        eq(userCourses.userId, userId),
        eq(userCourses.courseTitle, courseTitle)
      ));

    if (existing.length > 0) {
      return NextResponse.json({ error: 'Already enrolled in this course', course: existing[0] }, { status: 409 });
    }

    // Calculate deadline
    const weeks = durationWeeks || 4;
    const deadlineAt = new Date();
    deadlineAt.setDate(deadlineAt.getDate() + weeks * 7);

    const newCourse = await db.insert(userCourses).values({
      userId,
      courseTitle,
      courseUrl: courseUrl || null,
      courseSource: courseSource || 'udemy',
      courseThumbnail: courseThumbnail || null,
      courseInstructor: courseInstructor || null,
      priority: priority || 'medium',
      status: 'enrolled',
      deadlineAt,
    }).returning();

    return NextResponse.json({ course: newCourse[0] }, { status: 201 });
  } catch (error) {
    console.error('Error enrolling in course:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PATCH - Update course status
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { courseId, status, notes } = body;

    if (!courseId || !status) {
      return NextResponse.json({ error: 'courseId and status are required' }, { status: 400 });
    }

    const updateData: Record<string, any> = { status };

    if (status === 'completed') {
      updateData.completedAt = new Date();
    }
    if (status === 'in_progress') {
      // Extend deadline by 1 week when user says "still working"
      const newDeadline = new Date();
      newDeadline.setDate(newDeadline.getDate() + 7);
      updateData.deadlineAt = newDeadline;
    }
    if (notes !== undefined) {
      updateData.notes = notes;
    }
    if (body.progress !== undefined) {
      updateData.progress = Math.min(100, Math.max(0, parseInt(body.progress, 10)));
    }
    updateData.promptedAt = new Date();

    const updated = await db
      .update(userCourses)
      .set(updateData)
      .where(eq(userCourses.id, courseId))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    return NextResponse.json({ course: updated[0] });
  } catch (error) {
    console.error('Error updating course:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
