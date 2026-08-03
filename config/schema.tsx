import { integer, pgTable, varchar, json, timestamp, text } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  credits: integer().default(5),
});

export const projectsTable = pgTable("projects", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  projectId: varchar({ length: 255 }).notNull().unique(),
  name: varchar({ length: 255 }).notNull(),
  userInput: varchar().notNull(),
  device: varchar({ length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  config: json(),
  userId: varchar().references(() => usersTable.email).notNull(),
  projectVisualDescription: text(),
  theme: varchar("theme"),
});

export const ScreenConfigTable = pgTable("screen_config", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  projectId: varchar({ length: 255 }).references(() => projectsTable.projectId).notNull(),
  screenId: varchar({ length: 255 }).notNull(),
  screenName: varchar({ length: 255 }),
  purpose: varchar({ length: 255 }),
  screenDescription: varchar({ length: 255 }),
  code: text("code"),
  theme: varchar("theme"),
  projectName: varchar("project_name", { length: 255 }),
});