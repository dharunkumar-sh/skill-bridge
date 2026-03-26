import { NextResponse } from "next/server";
import { db } from "@/src/db";
import { users } from "@/src/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, repos } = body;

    if (!email || !repos || !Array.isArray(repos)) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 },
      );
    }

    // Analyze languages and technologies from repositories
    const languageCount: Record<string, number> = {};
    const technologies: Set<string> = new Set();

    repos.forEach((repo: any) => {
      if (repo.language) {
        languageCount[repo.language] = (languageCount[repo.language] || 0) + 1;
        technologies.add(repo.language);
      }
    });

    // Determine primary skills based on most used languages
    const sortedLanguages = Object.entries(languageCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([lang]) => lang);

    // Calculate skill level based on repo count, stars, and complexity
    const totalStars = repos.reduce(
      (sum: number, repo: any) => sum + (repo.stars || 0),
      0,
    );
    const totalRepos = repos.length;

    let skillLevel = "beginner";
    if (totalRepos >= 10 && totalStars >= 50) {
      skillLevel = "advanced";
    } else if (totalRepos >= 5 || totalStars >= 10) {
      skillLevel = "intermediate";
    }

    // Update user's skill status in database
    await db
      .update(users)
      .set({
        skillStatus: skillLevel,
      })
      .where(eq(users.email, email));

    return NextResponse.json({
      success: true,
      analysis: {
        primaryLanguages: sortedLanguages,
        skillLevel,
        totalRepos,
        totalStars,
        technologies: Array.from(technologies),
      },
    });
  } catch (error) {
    console.error("Error analyzing repositories:", error);
    return NextResponse.json(
      { error: "Failed to analyze repositories" },
      { status: 500 },
    );
  }
}
