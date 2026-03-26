import { pgTable, text, timestamp, uuid, boolean } from "drizzle-orm/pg-core";

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
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
