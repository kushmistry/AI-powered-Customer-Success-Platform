// ──────────────────────────────────────────────
// Enums (matching backend values & shared constants)
// ──────────────────────────────────────────────

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  VIEWER = 'viewer',
}

export enum CustomerStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  CHURNED = 'churned',
}

export enum InteractionType {
  MEETING = 'meeting',
  CALL = 'call',
  EMAIL = 'email',
}

export enum Sentiment {
  POSITIVE = 'positive',
  NEUTRAL = 'neutral',
  NEGATIVE = 'negative',
}

// ──────────────────────────────────────────────
// Domain Models
// ──────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  created_at: string;
  updated_at?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  company: string;
  status: CustomerStatus;
  created_by?: string;
  created_at: string;
  updated_at?: string;
}

export interface AIInsight {
  id: string;
  interaction_id: string;
  summary: string;
  sentiment: Sentiment;
  action_items: string[];
  key_risks: string[];
  generated_at: string;
}

export interface Interaction {
  id: string;
  customer_id: string;
  created_by?: string;
  type: InteractionType;
  subject: string;
  notes: string;
  interaction_date: string;
  created_at: string;
  updated_at?: string;
  customer?: Customer;
  insight?: AIInsight | null;
}

// ──────────────────────────────────────────────
// Filters
// ──────────────────────────────────────────────

export interface CustomerFilters {
  status?: string;
  search?: string;
  page?: number;
  size?: number;
}

export interface InteractionFilters {
  customer_id?: string;
  type?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  size?: number;
}

// ──────────────────────────────────────────────
// Dashboard
// ──────────────────────────────────────────────

export interface DashboardMetrics {
  total_customers: number;
  total_interactions: number;
  customers_by_status: Record<string, number>;
  interactions_by_type: Record<string, number>;
  sentiment_distribution: Record<string, number>;
  recent_interactions: Interaction[];
  monthly_trend: Array<{
    month: string;
    interactions: number;
    customers: number;
  }>;
}

// ──────────────────────────────────────────────
// Auth
// ──────────────────────────────────────────────

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

// ──────────────────────────────────────────────
// API Responses
// ──────────────────────────────────────────────

export interface PaginationMeta {
  page: number;
  size: number;
  total: number;
  pages: number;
}

export interface ApiResponse<T = any> {
  status: boolean;
  message: string;
  data: T;
  meta?: PaginationMeta | null;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface ApiErrorResponse {
  status: boolean;
  message: string;
  data: null;
  meta: null;
}
