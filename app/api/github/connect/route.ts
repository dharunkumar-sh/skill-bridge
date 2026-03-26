import { NextResponse } from "next/server";
import { db } from "@/src/db";
import { users } from "@/src/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, githubUsername } = body;

    if (!email || !githubUsername) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Update user with GitHub username
    const updatedUsers = await db
      .update(users)
      .set({ githubUsername })
      .where(eq(users.email, email))
      .returning();

    if (updatedUsers.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user: updatedUsers[0] });
  } catch (error) {
    console.error("Error connecting GitHub:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
