import { NextResponse } from "next/server";
import axios from "axios";

const DEFAULT_HOST = "jsearch.p.rapidapi.com";

const SKILL_KEYWORDS = [
  "javascript",
  "typescript",
  "react",
  "next.js",
  "node.js",
  "python",
  "java",
  "sql",
  "aws",
  "docker",
  "kubernetes",
  "graphql",
  "rest",
  "html",
  "css",
  "tailwind",
  "mongodb",
  "postgresql",
  "git",
  "testing",
];

function extractSkills(text: string) {
  const normalized = text.toLowerCase();
  return SKILL_KEYWORDS.filter((skill) => normalized.includes(skill));
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function scoreJob(job: any, targetRole: string, userSkills: string[]) {
  const title = (job.title || "").toLowerCase();
  const description = (job.description || "").toLowerCase();
  const combinedText = `${title} ${description}`;

  const matchedSkills = userSkills.filter((skill) =>
    combinedText.includes(skill),
  );
  const roleWords = (targetRole || "")
    .toLowerCase()
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => word.length > 2);

  const roleMatches = roleWords.filter(
    (word) => title.includes(word) || description.includes(word),
  );

  let score = 35;
  score += matchedSkills.length * 12;
  score += roleMatches.length * 8;

  if ((job.location || "").toLowerCase().includes("remote")) {
    score += 5;
  }

  const finalScore = clamp(score, 35, 96);

  const reasonParts: string[] = [];
  if (matchedSkills.length > 0) {
    reasonParts.push(`Matched skills: ${matchedSkills.slice(0, 4).join(", ")}`);
  }
  if (roleMatches.length > 0) {
    reasonParts.push(`Aligned with your role focus: ${targetRole}`);
  }
  if (reasonParts.length === 0) {
    reasonParts.push("Strong baseline fit for your profile and growth path");
  }

  return {
    matchScore: finalScore,
    reason: reasonParts.join(". "),
  };
}

function normalizeJob(raw: any) {
  const title = raw.job_title || raw.title || "Untitled Job";
  const company = raw.employer_name || raw.company_name || "Unknown Company";
  const location =
    raw.job_city && raw.job_country
      ? `${raw.job_city}, ${raw.job_country}`
      : raw.job_location || raw.job_country || "Not specified";

  const salaryParts = [
    raw.job_min_salary
      ? `$${Math.round(raw.job_min_salary).toLocaleString()}`
      : "",
    raw.job_max_salary
      ? `$${Math.round(raw.job_max_salary).toLocaleString()}`
      : "",
  ].filter(Boolean);

  const description = raw.job_description || "";
  const highlights = raw.job_highlights || {};
  const qualifications = Array.isArray(highlights.Qualifications)
    ? highlights.Qualifications
    : [];
  const responsibilities = Array.isArray(highlights.Responsibilities)
    ? highlights.Responsibilities
    : [];

  const tags = Array.from(
    new Set([
      ...extractSkills(`${title} ${description}`),
      ...extractSkills(qualifications.join(" ")),
      ...extractSkills(responsibilities.join(" ")),
    ]),
  ).slice(0, 8);

  return {
    id: raw.job_id || raw.id || Math.random().toString(36).slice(2),
    title,
    company,
    location,
    salary:
      salaryParts.length === 2
        ? `${salaryParts[0]} - ${salaryParts[1]}`
        : salaryParts[0] || "",
    type: raw.job_employment_type || "Full-time",
    description,
    postedAt:
      raw.job_posted_at_datetime_utc || raw.job_posted_at_timestamp || null,
    applyUrl: raw.job_apply_link || raw.job_google_link || null,
    tags,
  };
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const query = searchParams.get("query") || "software developer jobs";
    const page = searchParams.get("page") || "1";
    const numPages = searchParams.get("num_pages") || "1";
    const country = searchParams.get("country") || "us";
    const datePosted = searchParams.get("date_posted") || "all";
    const mode = searchParams.get("mode") || "search";
    const targetRole = searchParams.get("targetRole") || "software developer";
    const skills = (searchParams.get("skills") || "")
      .split(",")
      .map((skill) => skill.trim().toLowerCase())
      .filter(Boolean);

    const apiKey = process.env.JSEARCH_RAPIDAPI_KEY || process.env.RAPIDAPI_KEY;
    const apiHost = process.env.JSEARCH_RAPIDAPI_HOST || DEFAULT_HOST;

    if (!apiKey) {
      return NextResponse.json(
        {
          jobs: [],
          source: "config",
          message: "JSearch API key is missing",
        },
        { status: 500 },
      );
    }

    const response = await axios.get("https://jsearch.p.rapidapi.com/search", {
      params: {
        query,
        page,
        num_pages: numPages,
        country,
        date_posted: datePosted,
      },
      headers: {
        "x-rapidapi-key": apiKey,
        "x-rapidapi-host": apiHost,
        "Content-Type": "application/json",
      },
      timeout: 12000,
    });

    const rawJobs = Array.isArray(response.data?.data)
      ? response.data.data
      : [];
    const normalized = rawJobs.map(normalizeJob);

    if (mode === "curated") {
      const curated = normalized
        .map((job: any) => ({
          ...job,
          ...scoreJob(job, targetRole, skills),
        }))
        .sort((a: any, b: any) => b.matchScore - a.matchScore)
        .slice(0, 12);

      return NextResponse.json({
        jobs: curated,
        source: "jsearch",
        mode: "curated",
      });
    }

    return NextResponse.json({
      jobs: normalized.slice(0, 20),
      source: "jsearch",
      mode: "search",
    });
  } catch (error: any) {
    console.error("Error fetching jobs from JSearch:", error?.message);
    return NextResponse.json(
      {
        jobs: [],
        source: "error",
        message:
          error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch jobs",
      },
      { status: 500 },
    );
  }
}
