import {
  pgTable,
  text,
  timestamp,
  uuid,
  boolean,
  jsonb,
  integer,
} from "drizzle-orm/pg-core";

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
  // Subscription fields
  subscriptionPlan: text("subscription_plan").default("free"), // free, professional, premium
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  subscriptionStatus: text("subscription_status").default("inactive"), // active, inactive, canceled, past_due
  subscriptionStartDate: timestamp("subscription_start_date"),
  subscriptionEndDate: timestamp("subscription_end_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userCourses = pgTable("user_courses", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
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
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  mentorName: text("mentor_name").notNull(),
  mentorRole: text("mentor_role").notNull(),
  mentorAvatar: text("mentor_avatar").notNull(),
  topic: text("topic").notNull(),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  lastActiveAt: timestamp("last_active_at").defaultNow().notNull(),
});

export const mentorshipMessages = pgTable("mentorship_messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: uuid("session_id")
    .notNull()
    .references(() => mentorshipSessions.id),
  sender: text("sender").notNull(), // 'user' or 'ai'
  content: text("content").notNull(),
  sentAt: timestamp("sent_at").defaultNow().notNull(),
});

export const payments = pgTable("payments", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  stripePaymentIntentId: text("stripe_payment_intent_id").notNull().unique(),
  amount: integer("amount").notNull(), // in cents
  currency: text("currency").notNull().default("inr"),
  status: text("status").notNull(), // succeeded, processing, requires_payment_method, etc.
  plan: text("plan").notNull(), // professional, premium
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => users.id),
  stripeSubscriptionId: text("stripe_subscription_id").notNull().unique(),
  plan: text("plan").notNull(), // professional, premium
  status: text("status").notNull(), // active, inactive, canceled, past_due
  currentPeriodStart: timestamp("current_period_start").notNull(),
  currentPeriodEnd: timestamp("current_period_end").notNull(),
  cancelledAt: timestamp("cancelled_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
