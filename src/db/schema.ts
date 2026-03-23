import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash'),
  picture: text('picture'),
  authProvider: text('auth_provider').notNull().default('credentials'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
