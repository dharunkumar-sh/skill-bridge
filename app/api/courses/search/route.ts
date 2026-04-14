import { NextResponse } from "next/server";
import axios from "axios";

// Simple in-memory cache to avoid hitting rate limits
let courseCache: { data: any; timestamp: number; query: string } | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function looksLikeCourse(item: any) {
  if (!item || typeof item !== "object") return false;
  return Boolean(
    item.name ||
    item.title ||
    item.course_title ||
    item.headline ||
    item.url ||
    item.link,
  );
}

function extractCourseCandidates(payload: any): any[] {
  if (Array.isArray(payload)) {
    return payload.filter(looksLikeCourse);
  }

  if (!payload || typeof payload !== "object") {
    return [];
  }

  const commonListKeys = [
    "courses",
    "results",
    "items",
    "data",
    "list",
    "deals",
  ];

  for (const key of commonListKeys) {
    if (Array.isArray((payload as any)[key])) {
      const list = (payload as any)[key].filter(looksLikeCourse);
      if (list.length > 0) return list;
    }
  }

  // Some payloads keep arrays nested one level deeper.
  for (const value of Object.values(payload)) {
    if (Array.isArray(value)) {
      const list = value.filter(looksLikeCourse);
      if (list.length > 0) return list;
    }
    if (value && typeof value === "object") {
      const nested = extractCourseCandidates(value);
      if (nested.length > 0) return nested;
    }
  }

  return [];
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query") || "";
    const page = searchParams.get("page") || "0";

    const apiKey = process.env.RAPIDAPI_KEY;
    const apiHost = process.env.RAPIDAPI_HOST;

    if (!apiKey || !apiHost) {
      return NextResponse.json({
        courses: [],
        source: "fallback",
        message: "RapidAPI key not configured",
      });
    }

    // Check cache
    if (
      courseCache &&
      courseCache.query === `${query}-${page}` &&
      Date.now() - courseCache.timestamp < CACHE_TTL
    ) {
      return NextResponse.json({ courses: courseCache.data, source: "cache" });
    }

    const response = await axios.get(`https://${apiHost}/`, {
      // Some RapidAPI providers reject unknown params; keep upstream request minimal.
      params: { page },
      headers: {
        "x-rapidapi-key": apiKey,
        "x-rapidapi-host": apiHost,
        "Content-Type": "application/json",
      },
      timeout: 10000,
    });

    const rawCourses = response.data;

    // Normalize the response into a consistent shape
    const courses = extractCourseCandidates(rawCourses);

    // Map to a normalized course object
    const normalizedCourses = courses.map((c: any) => ({
      id: c.id || c.courseId || c._id || Math.random().toString(36),
      title: c.name || c.title || c.course_title || "Untitled Course",
      url: c.link || c.url || c.course_url || c.couponUrl || "#",
      thumbnail: c.image || c.thumbnail || c.course_image || c.img || "",
      instructor:
        c.author || c.instructor || c.instructorName || c.creator || "Unknown",
      category: c.category || c.subcategory || "",
      rating: c.rating || c.avg_rating || 0,
      students: c.students || c.num_subscribers || 0,
      description: c.description || c.headline || c.short_description || "",
      isFree: true,
      source: "udemy",
    }));

    const queryLower = query.trim().toLowerCase();
    const filteredCourses = queryLower
      ? normalizedCourses.filter((course) => {
          const searchableText = [
            course.title,
            course.instructor,
            course.category,
            course.description,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return searchableText.includes(queryLower);
        })
      : normalizedCourses;

    const finalCourses = filteredCourses.slice(0, 20);

    // Update cache
    courseCache = {
      data: finalCourses,
      timestamp: Date.now(),
      query: `${query}-${page}`,
    };

    return NextResponse.json({ courses: finalCourses, source: "rapidapi" });
  } catch (error: any) {
    console.error("Error fetching courses from RapidAPI:", error?.message);
    return NextResponse.json({
      courses: [],
      source: "error",
      message: error?.message || "Failed to fetch courses",
    });
  }
}
