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
 * 1. Drizzle 表定义
 * 用户表 - 存储用户基本信息
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
 * Token 表定义
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
 * 关系定义
 */
export const tokenRelations = relations(tokenTable, ({ one }) => ({
	owner: one(usersTable, {
		fields: [tokenTable.ownerId],
		references: [usersTable.id],
	}),
}));

/**
 * 用户模型命名空间
 * 包含所有用户相关的 Schema、类型定义和业务逻辑
 */
export namespace UsersModel {
	// 用户状态枚举
	export enum UserStatus {
		ACTIVE = "active",
		DISABLED = "disabled",
		PENDING = "pending",
		SUSPENDED = "suspended",
	}

	// 基础 TypeBox Schema（基于 Drizzle 表生成）
	export const Insert = createInsertSchema(usersTable, {});
	export const Update = createUpdateSchema(usersTable);
	export const Select = createSelectSchema(usersTable);

	// 业务 DTO Schemas
	export const Create = t.Omit(Insert, ["id", "createdAt", "updatedAt"]);
	export const Patch = t.Omit(Update, ["id", "createdAt", "updatedAt", "password"]);

	// 查询 Schemas
	export const ListQuery = t.Composite([
		PageQuerySchema,
		t.Object({
			username: t.String({ optional: true }),
			email: t.String({ optional: true }),
			isActive: t.Boolean({ optional: true }),
		}),
	]);

	// 操作 Schemas
	export const Login = t.Object({
		username: t.String({ minLength: 1 }),
		password: t.String({ minLength: 1 }),
	});

	export const ChangePassword = t.Object({
		oldPassword: t.String({ minLength: 1 }),
		newPassword: t.String({ minLength: 6 }),
	});

	// front need type ( VO - View Object)
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
