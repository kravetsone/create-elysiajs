export function getUsersModel() {
  return `import { relations } from "drizzle-orm";
import {
	index,
	integer,
	boolean as pgBoolean,
	pgTable,
	text,
	varchar,
} from "drizzle-orm/pg-core";
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "drizzle-typebox";
import { t } from "elysia";
import { createdAt, id, updatedAt } from "../../libs/schemaHelper";
import { PageQuerySchema } from "../../libs/common-schemas";

/**
 * 1. Drizzle table definition
 * User table - stores basic user information
 */
export const usersTable = pgTable(
	"users",
	{
		id,
		username: varchar("username", { length: 50 }).notNull().unique(),
		password: varchar("password", { length: 255 }).notNull(), 
		email: varchar("email", { length: 100 }).unique().notNull(), 
		role: varchar("role", { length: 50 }).notNull().default("user"),
		nickname: varchar("nickname", { length: 50 }).notNull(),
		avatar: varchar("avatar", { length: 255 }),
		isActive: pgBoolean("isActive").notNull().default(true), 
		createdAt,
		updatedAt,
	},
	(users) => [index("user_id_idx").on(users.id)],
);

/**
 * Token table definition
 */
export const tokenTable = pgTable(
	"tokens",
	{
		id,
    ownerId: integer("owner_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),	
    accessToken: text("access_token").notNull(),
		refreshToken: text("refresh_token").notNull(),
		createdAt,
	},
	(token) => [index("token_id_idx").on(token.id)],
);

/**
 * Relationship definition
 */
export const tokenRelations = relations(tokenTable, ({ one }) => ({
	owner: one(usersTable, {
		fields: [tokenTable.ownerId],
		references: [usersTable.id],
	}),
}));

/**
 * User model namespace
 * Contains all user-related schemas, type definitions and business logic
 */
export namespace UsersModel {
	// User status enum
	export enum UserStatus {
		ACTIVE = "active",
		DISABLED = "disabled",
		PENDING = "pending",
		SUSPENDED = "suspended",
	}

	// Basic TypeBox schemas (generated from Drizzle tables)
	export const Insert = createInsertSchema(usersTable, {});
	export const Update = createUpdateSchema(usersTable);
	export const Select = createSelectSchema(usersTable);

	// Business DTO schemas
	export const Create = t.Omit(Insert, ["id", "createdAt", "updatedAt"]);
	export const Patch = t.Omit(Update, ["id", "createdAt", "updatedAt", "password"]);

	// Query schemas
	export const ListQuery = t.Composite([
		PageQuerySchema,
		t.Object({
			username: t.String({ optional: true }),
			email: t.String({ optional: true }),
			isActive: t.Boolean({ optional: true }),
		}),
	]);

	// Operation schemas
	export const Login = t.Object({
		username: t.String({ minLength: 1 }),
		password: t.String({ minLength: 1 }),
	});

	export const ChangePassword = t.Object({
		oldPassword: t.String({ minLength: 1 }),
		newPassword: t.String({ minLength: 6 }),
	});

	// Frontend needed type (VO - View Object)
	// WARNING: Always exclude password field when querying users for this VO
	export const ViewObject = t.Object({
		id: t.Integer(),
		username: t.String(),
		email: t.String(),
		role: t.String(),
		nickname: t.String(),
		avatar: t.String({ optional: true }),
		isActive: t.Boolean(),
		createdAt: t.Date(),
		updatedAt: t.Date(),
	});}

`;
}
