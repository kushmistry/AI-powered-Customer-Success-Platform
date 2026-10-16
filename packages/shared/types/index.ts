/** Core domain type definitions for the Customer Success Platform */

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string;
  status: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Interaction {
  id: string;
  customer_id: string;
  created_by: string;
  type: string;
  subject: string;
  notes: string;
  interaction_date: string;
  created_at: string;
  updated_at: string;
}

export interface AIInsight {
  id: string;
  interaction_id: string;
  summary: string;
  sentiment: string;
  action_items: string[];
  key_risks: string[];
  generated_at: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface ApiError {
  detail: string;
  status_code: number;
}
