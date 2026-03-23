import { NextResponse } from 'next/server';
import { db } from '@/src/db';
import { users } from '@/src/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, name, picture } = body;

    if (!email || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if user already exists
    const existingUsers = await db.select().from(users).where(eq(users.email, email));
    
    if (existingUsers.length > 0) {
      // User exists, smartly update their picture if it changed
      const user = existingUsers[0];
      if (picture && user.picture !== picture) {
        await db.update(users)
          .set({ picture })
          .where(eq(users.id, user.id));
        user.picture = picture;
      }
      return NextResponse.json({ user });
    }

    // Create new user
    const newUser = await db.insert(users).values({
      email,
      name,
      picture,
      authProvider: 'google',
    }).returning();

    return NextResponse.json({ user: newUser[0] }, { status: 201 });
  } catch (error) {
    console.error('Error in Google Auth API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
