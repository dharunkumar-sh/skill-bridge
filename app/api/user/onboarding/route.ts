import { NextResponse } from 'next/server';
import { db } from '@/src/db';
import { users } from '@/src/db/schema';
import { eq } from 'drizzle-orm';
import Groq from 'groq-sdk';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      email,
      mindset,
      skillStatus,
      knownTechnologies,
      targetRole,
      learningStyle,
      weeklyHours,
      workExperience,
      education,
      motivation,
      careerGoal,
    } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    let aiAnalysis = null;
    try {
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      const prompt = `You are a world-class career coach and AI learning advisor. Analyze a user's comprehensive profile and generate a hyper-personalized career development plan.

USER PROFILE:
- Career Stage: ${mindset}
- Self-Reported Skill Level: ${skillStatus}
- Known Technologies: ${knownTechnologies || 'None specified'}
- Target Role: ${targetRole}
- Learning Style Preference: ${learningStyle}
- Weekly Time Commitment: ${weeklyHours} hours/week
- Work Experience: ${workExperience || 'Not specified'}
- Education: ${education || 'Not specified'}
- Personal Motivation: ${motivation || 'Not specified'}
- Primary Career Goal: ${careerGoal}

INSTRUCTIONS:
1. Evaluate readiness for the target role "${targetRole}" honestly.
2. Identify skills they already have vs. critical missing skills for "${targetRole}".
3. Generate a realistic learning roadmap based on ${weeklyHours} hours/week.
4. Recommend 5-6 highly specific courses tailored to their skill gaps and learning style (${learningStyle}).
5. Suggest 4-5 realistic job opportunities that match their profile, with match scores.
6. Create actionable week-by-week milestones.

Return ONLY a valid JSON object with exactly this structure (no markdown, no explanation):
{
  "summary": "A warm, personalized 2-3 sentence greeting and overview of their learning journey ahead. Reference their specific goals and target role.",
  "roleSuitability": "A honest 2-3 sentence evaluation of their current readiness for the target role. Be encouraging but realistic.",
  "readinessScore": 45,
  "currentSkills": ["Skill they likely already have 1", "Skill 2", "Skill 3"],
  "requiredSkills": ["Critical missing skill 1", "Critical missing skill 2", "Critical missing skill 3"],
  "skillGapAnalysis": [
    {"skill": "Missing Skill Name", "priority": "high", "estimatedWeeks": 3, "description": "Why this skill matters for the target role"},
    {"skill": "Another Skill", "priority": "medium", "estimatedWeeks": 2, "description": "Brief reason"},
    {"skill": "Nice-to-have Skill", "priority": "low", "estimatedWeeks": 4, "description": "Brief reason"}
  ],
  "weeklyPlan": {
    "theory": 3,
    "practice": 4,
    "projects": 3
  },
  "learningPath": [
    {"week": "1-2", "focus": "Foundation Area", "resources": 3, "description": "What they'll learn and build"},
    {"week": "3-4", "focus": "Core Skill Area", "resources": 4, "description": "What they'll learn and build"},
    {"week": "5-8", "focus": "Advanced Topics", "resources": 3, "description": "What they'll learn and build"}
  ],
  "recommendedCourses": [
    {
      "title": "Specific Course Title",
      "level": "Beginner|Intermediate|Advanced",
      "icon": "📘",
      "description": "2-3 sentence description of what this course covers and why it's relevant to the user",
      "duration": "4 weeks",
      "priority": "high",
      "skills": ["Skill Tag 1", "Skill Tag 2", "Skill Tag 3"],
      "matchReason": "Why this course specifically matches this user's needs"
    },
    {
      "title": "Another Course",
      "level": "Intermediate",
      "icon": "⚡",
      "description": "Course description",
      "duration": "6 weeks",
      "priority": "medium",
      "skills": ["Skill 1", "Skill 2"],
      "matchReason": "Reason for recommendation"
    }
  ],
  "recommendedJobs": [
    {
      "title": "Specific Job Title",
      "company": "Realistic Company Name",
      "location": "City, Country or Remote",
      "salary": "Salary range in local currency",
      "type": "Full-time|Part-time|Contract|Remote",
      "matchScore": 85,
      "tags": ["Required Tech 1", "Required Tech 2", "Required Tech 3"],
      "reason": "2-sentence explanation of why this job matches the user based on their current skills and career goals"
    }
  ],
  "completedSkills": 0,
  "upcomingSessions": 1,
  "actionItems": [
    "Specific immediate action they should take this week",
    "Second actionable step for next week",
    "Third strategic action for the month",
    "Fourth long-term action"
  ],
  "personalityInsight": "A personalized learning tip based on their learning style preference and career stage. 2-3 sentences, practical advice.",
  "milestones": [
    {"title": "Foundation", "timeline": "Week 1-3", "description": "What they will accomplish in this phase"},
    {"title": "Build & Practice", "timeline": "Week 4-8", "description": "What they will accomplish"},
    {"title": "Portfolio & Apply", "timeline": "Week 9-12", "description": "What they will accomplish"}
  ]
}`;

      const response = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama-3.3-70b-versatile",
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 4096,
      });

      aiAnalysis = JSON.parse(response.choices[0]?.message?.content || "{}");
    } catch (aiError) {
      console.error('Error generating AI analysis:', aiError);
    }

    const updatedUsers = await db.update(users)
      .set({
        mindset,
        skillStatus,
        targetRole,
        careerGoal,
        knownTechnologies,
        learningStyle,
        weeklyHours,
        workExperience,
        education,
        motivation,
        hasCompletedOnboarding: true,
        aiAnalysis,
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
