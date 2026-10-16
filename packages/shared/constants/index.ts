/** Shared enums and validation constants for the Customer Success Platform */

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

export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 8,
  NAME_MAX_LENGTH: 100,
  EMAIL_MAX_LENGTH: 255,
  PHONE_MAX_LENGTH: 20,
  COMPANY_MAX_LENGTH: 200,
  SUBJECT_MAX_LENGTH: 255,
  NOTES_MAX_LENGTH: 10000,
} as const;
