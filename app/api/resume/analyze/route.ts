import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { extractText } from "unpdf";

/**
 * Advanced PDF text extraction using unpdf
 * unpdf is lightweight and handles various PDF formats better
 */
async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    // Convert Buffer to Uint8Array for unpdf
    const uint8Array = new Uint8Array(buffer);

    // Extract text using unpdf
    const { text, totalPages } = await extractText(uint8Array, {
      mergePages: true, // Merge all pages into single text
    });

    if (!text || text.trim().length === 0) {
      throw new Error("PDF appears to be empty or contains only images");
    }

    // Clean and normalize the extracted text
    const cleanedText = text
      .replace(/\r\n/g, "\n") // Normalize line endings
      .replace(/\n{3,}/g, "\n\n") // Remove excessive newlines
      .replace(/\s{2,}/g, " ") // Remove excessive spaces
      .replace(/\t/g, " ") // Replace tabs with spaces
      .trim();

    console.log(`Successfully extracted text from ${totalPages} pages`);

    return cleanedText;
  } catch (error: any) {
    console.error("PDF extraction error:", error);
    throw new Error(`Failed to parse PDF: ${error.message}`);
  }
}

/**
 * Analyze resume using Groq AI with parsed text content only
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("resume") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No resume file provided." },
        { status: 400 },
      );
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are supported." },
        { status: 400 },
      );
    }

    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      return NextResponse.json(
        { error: "GROQ_API_KEY is not configured on the server." },
        { status: 500 },
      );
    }

    // Step 1: Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Step 2: Extract text from PDF using unpdf
    let parsedText: string;
    try {
      parsedText = await extractTextFromPDF(buffer);
    } catch (parseError: any) {
      return NextResponse.json(
        {
          error:
            parseError.message ||
            "Failed to parse PDF content. Please ensure the PDF contains readable text.",
        },
        { status: 400 },
      );
    }

    // Validate parsed content
    if (parsedText.length < 50) {
      return NextResponse.json(
        {
          error:
            "Resume content is too short. Please ensure the PDF contains readable text (not just images).",
        },
        { status: 400 },
      );
    }

    console.log(`Extracted ${parsedText.length} characters from PDF`);

    // Step 3: Truncate to reasonable length for AI processing (max ~6000 chars)
    const truncatedText = parsedText.substring(0, 6000);

    // Step 4: Initialize Groq SDK
    const groq = new Groq({ apiKey: groqApiKey });

    // Step 5: Construct AI prompt for resume analysis
    const prompt = `You are an expert technical recruiter and ATS (Applicant Tracking System) software. 
Analyze the following extracted text from a candidate's resume and evaluate it against modern software engineering industry standards.

IMPORTANT: Respond ONLY with a valid JSON object. Do NOT include markdown code blocks, explanations, or any other text.

Required JSON format:
{
  "atsScore": <number between 0-100 based on structure, impact, keywords, and clarity>,
  "matchedSkills": [<array of strings, up to 10 prominent technical skills found>],
  "missingSkills": [<array of strings, up to 5 critical industry skills that are missing>],
  "improvements": [<array of 3 distinct, actionable improvements for bullet points or formatting>]
}

Resume Text:
"""
${truncatedText}
"""`;

    // Step 6: Query Groq with latest supported model
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile", // Latest supported model
      temperature: 0.2, // Low temperature for consistent, deterministic results
      max_tokens: 1500,
      response_format: { type: "json_object" },
    });

    const responseText = completion.choices[0]?.message?.content || "{}";

    // Step 7: Parse and validate AI response
    let analysisResult;
    try {
      analysisResult = JSON.parse(responseText);

      // Validate required fields
      if (
        typeof analysisResult.atsScore !== "number" ||
        !Array.isArray(analysisResult.matchedSkills)
      ) {
        throw new Error("Invalid AI response format");
      }

      // Ensure all fields exist with defaults
      analysisResult = {
        atsScore: Math.min(100, Math.max(0, analysisResult.atsScore || 0)),
        matchedSkills: analysisResult.matchedSkills || [],
        missingSkills: analysisResult.missingSkills || [],
        improvements: analysisResult.improvements || [],
      };
    } catch (parseError) {
      console.error("Failed to parse AI response:", responseText);
      return NextResponse.json(
        { error: "Failed to parse AI analysis results. Please try again." },
        { status: 500 },
      );
    }

    return NextResponse.json(analysisResult);
  } catch (error: any) {
    console.error("Resume Analysis API Error:", error);
    return NextResponse.json(
      {
        error: error.message || "An unexpected error occurred during analysis.",
      },
      { status: 500 },
    );
  }
}
