import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
// @ts-ignore
import PDFParser from "pdf2json";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("resume") as File;

    if (!file) {
      return NextResponse.json({ error: "No resume file provided." }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Only PDF files are supported." }, { status: 400 });
    }

    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      return NextResponse.json(
        { error: "GROQ_API_KEY is not configured on the server. Please add it to your .env.local file." },
        { status: 500 }
      );
    }

    // Convert Next.js File object to Node.js Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Provide the parsed content to the AI using advanced parsing package (pdf2json)
    let parsedText = await new Promise<string>((resolve, reject) => {
      const pdfParser = new PDFParser(null, 1); // 1 = returns raw text content
      
      pdfParser.on("pdfParser_dataError", (errData: any) => reject(errData.parserError));
      pdfParser.on("pdfParser_dataReady", () => {
        resolve(pdfParser.getRawTextContent());
      });

      pdfParser.parseBuffer(buffer);
    });

    if (!parsedText || parsedText.trim().length === 0) {
      return NextResponse.json({ error: "The uploaded PDF appears to be empty or contains only images (scanned PDF)." }, { status: 400 });
    }

    // Clean up excessive newlines
    parsedText = parsedText.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n');

    // Initialize Groq SDK
    const groq = new Groq({ apiKey: groqApiKey });

    // Construct the LLM Prompt
    const prompt = `
    You are an expert technical recruiter and ATS (Applicant Tracking System) software. 
    Analyze the following extracted text from a candidate's resume and evaluate it against modern software engineering industry standards.

    Extract the data and respond EXACTLY in the following JSON format. Do NOT wrap it in markdown blockquotes like \`\`\`json. Just return the raw JSON object.
    {
      "atsScore": <number between 0-100 based on structure, impact, keywords, and clarity>,
      "matchedSkills": [<array of string, up to 10 prominent engineering skills found>],
      "missingSkills": [<array of string, up to 5 critical industry standard skills that are missing based on what they do have>],
      "improvements": [<array of 3 distinct, highly actionable improvements for their bullet points or formatting>]
    }

    Resume Text to analyze:
    """
    ${parsedText.substring(0, 5000)} // Truncating to approx 5000 chars to avoid prompt bloat
    """
    `;

    // Query Groq Llama3 70B model or mixtral
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama3-8b-8192", // Fast and capable model
      temperature: 0.2, // Low temp for more deterministic ATS formatting
      response_format: { type: "json_object" },
    });

    const responseText = completion.choices[0]?.message?.content || "{}";
    
    // Parse the JSON string returned by Groq
    const analysisResult = JSON.parse(responseText);

    return NextResponse.json(analysisResult);

  } catch (error: any) {
    console.error("Resume Analysis API Error:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred during AI analysis." },
      { status: 500 }
    );
  }
}
