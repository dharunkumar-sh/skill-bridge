CREATE TABLE "user_courses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"course_title" text NOT NULL,
	"course_url" text,
	"course_source" text DEFAULT 'udemy' NOT NULL,
	"course_thumbnail" text,
	"course_instructor" text,
	"priority" text DEFAULT 'medium',
	"status" text DEFAULT 'enrolled' NOT NULL,
	"enrolled_at" timestamp DEFAULT now() NOT NULL,
	"deadline_at" timestamp,
	"completed_at" timestamp,
	"prompted_at" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text,
	"picture" text,
	"auth_provider" text DEFAULT 'credentials' NOT NULL,
	"github_username" text,
	"has_completed_onboarding" boolean DEFAULT false NOT NULL,
	"mindset" text,
	"skill_status" text,
	"career_goal" text,
	"target_role" text,
	"known_technologies" text,
	"learning_style" text,
	"weekly_hours" text,
	"work_experience" text,
	"education" text,
	"motivation" text,
	"ai_analysis" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "user_courses" ADD CONSTRAINT "user_courses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;