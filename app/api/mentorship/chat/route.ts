import { NextResponse } from 'next/server';
import { db } from '@/src/db';
import { mentorshipMessages, mentorshipSessions } from '@/src/db/schema';
import { eq, asc } from 'drizzle-orm';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// GET fetch messages for a specific session
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    const messages = await db
      .select()
      .from(mentorshipMessages)
      .where(eq(mentorshipMessages.sessionId, sessionId))
      .orderBy(asc(mentorshipMessages.sentAt));

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Error fetching mentorship messages:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST send a message and trigger Groq AI response
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sessionId, content } = body;

    if (!sessionId || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Insert User Message
    const userMsg = await db.insert(mentorshipMessages).values({
      sessionId,
      sender: 'user',
      content,
    }).returning();

    // Fetch the Session details (to know what Persona the AI should adopt)
    const sessionResult = await db
      .select()
      .from(mentorshipSessions)
      .where(eq(mentorshipSessions.id, sessionId));

    if (sessionResult.length === 0) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const sessionData = sessionResult[0];

    // Fetch up to the last 15 messages for context
    const recentMessages = await db
      .select()
      .from(mentorshipMessages)
      .where(eq(mentorshipMessages.sessionId, sessionId))
      .orderBy(asc(mentorshipMessages.sentAt));

    // Limit to last 15 to fit context comfortably and keep speed high
    const msgHistoryForAI = recentMessages.slice(-15).map(m => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      content: m.content
    })) as { role: 'user' | 'assistant' | 'system', content: string }[];

    // Construct the System Prompt based on the Persona
    const systemPrompt = `You are ${sessionData.mentorName}, a highly experienced ${sessionData.mentorRole}. 
You are currently mentoring the user on the topic of: ${sessionData.topic}.
Your tone should be professional, encouraging, and deeply knowledgeable. Act exactly like a real human mentor.
Do not break character. Do not say you are an AI language model. Keep your responses engaging, asking thoughtful follow-up questions to help the mentee learn. Talk conversationally (avoid huge unreadable walls of text when possible).`;

    msgHistoryForAI.unshift({ role: 'system', content: systemPrompt });

    // Call Groq API
    const chatCompletion = await groq.chat.completions.create({
      messages: msgHistoryForAI,
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 1024,
      top_p: 1,
    });

    const aiResponseContent = chatCompletion.choices[0]?.message?.content || "I'm sorry, I encountered an issue processing that. Could we try again?";

    // Insert AI Message
    const aiMsg = await db.insert(mentorshipMessages).values({
      sessionId,
      sender: 'ai',
      content: aiResponseContent,
    }).returning();

    // Update session last active time
    await db
      .update(mentorshipSessions)
      .set({ lastActiveAt: new Date() })
      .where(eq(mentorshipSessions.id, sessionId));

    return NextResponse.json({
      userMessage: userMsg[0],
      aiMessage: aiMsg[0],
    }, { status: 201 });
  } catch (error) {
    console.error('Error processing chat:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
