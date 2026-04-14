import { pgTable, text, timestamp, uuid, boolean, jsonb, integer } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"),
  picture: text("picture"),
  authProvider: text("auth_provider").notNull().default("credentials"),
  githubUsername: text("github_username"),
  hasCompletedOnboarding: boolean("has_completed_onboarding")
    .notNull()
    .default(false),
  mindset: text("mindset"),
  skillStatus: text("skill_status"),
  careerGoal: text("career_goal"),
  targetRole: text("target_role"),
  knownTechnologies: text("known_technologies"),
  learningStyle: text("learning_style"),
  weeklyHours: text("weekly_hours"),
  workExperience: text("work_experience"),
  education: text("education"),
  motivation: text("motivation"),
  aiAnalysis: jsonb("ai_analysis"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userCourses = pgTable("user_courses", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id),
  courseTitle: text("course_title").notNull(),
  courseUrl: text("course_url"),
  courseSource: text("course_source").notNull().default("udemy"),
  courseThumbnail: text("course_thumbnail"),
  courseInstructor: text("course_instructor"),
  priority: text("priority").default("medium"),
  status: text("status").notNull().default("enrolled"),
  enrolledAt: timestamp("enrolled_at").defaultNow().notNull(),
  deadlineAt: timestamp("deadline_at"),
  completedAt: timestamp("completed_at"),
  promptedAt: timestamp("prompted_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const mentorshipSessions = pgTable("mentorship_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id),
  mentorName: text("mentor_name").notNull(),
  mentorRole: text("mentor_role").notNull(),
  mentorAvatar: text("mentor_avatar").notNull(),
  topic: text("topic").notNull(),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  lastActiveAt: timestamp("last_active_at").defaultNow().notNull(),
});

export const mentorshipMessages = pgTable("mentorship_messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: uuid("session_id").notNull().references(() => mentorshipSessions.id),
  sender: text("sender").notNull(), // 'user' or 'ai'
  content: text("content").notNull(),
  sentAt: timestamp("sent_at").defaultNow().notNull(),
});
