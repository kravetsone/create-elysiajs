import type { PreferencesType } from "../../utils";

// 导出所有类型相关的模板函数
export * from "./package.json";
export * from "./tsconfig.json";

export function getTypesIndex(preferences: PreferencesType) {
	return `// 类型定义包 - 前后端共享类型
// 这个包包含了前端可以直接使用的后端定义的类型

// 数据库相关类型
export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Partner {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

// API 响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// 请求参数类型
export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface CreateUserRequest {
  email: string;
  name?: string;
}

export interface CreatePartnerRequest {
  name: string;
  email?: string;
  phone?: string;
}

// 健康检查类型
export interface HealthResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  environment: string;
}

${
	preferences.orm !== "None"
		? `
// 数据库查询相关类型
export interface DatabaseConnection {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
}

export interface DatabaseConfig {
  url?: string;
  connection?: DatabaseConnection;
}
`
		: ""
}

${
	preferences.telegramRelated
		? `
// Telegram 相关类型
export interface TelegramInitData {
  query_id?: string;
  user?: TelegramUser;
  auth_date: string;
  hash: string;
}

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

export interface AuthenticatedRequest {
  user: TelegramUser;
  initData: TelegramInitData;
}
`
		: ""
}

// 错误类型
export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

// 通用状态枚举
export enum Status {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  DELETED = 'deleted'
}

// 排序类型
export interface SortParams {
  field: string;
  order: 'asc' | 'desc';
}

// 过滤类型
export interface FilterParams {
  search?: string;
  status?: Status;
  dateFrom?: string;
  dateTo?: string;
}
`;
}
