import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format } from 'date-fns';

/**
 * Merge Tailwind CSS classes with proper conflict resolution.
 * Combines clsx (conditional classes) with tailwind-merge (dedup).
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format an ISO date string to a human-readable date (e.g. "Oct 16, 2026").
 */
export function formatDate(date: string): string {
  return format(new Date(date), 'MMM d, yyyy');
}

/**
 * Format an ISO date string to a human-readable date + time (e.g. "Oct 16, 2026, 2:30 PM").
 */
export function formatDateTime(date: string): string {
  return format(new Date(date), 'MMM d, yyyy, h:mm a');
}

/**
 * Return Tailwind color classes for a given sentiment value.
 */
export function getSentimentColor(sentiment: string): string {
  switch (sentiment.toLowerCase()) {
    case 'positive':
      return 'text-success-600 bg-success-50 border-success-200';
    case 'negative':
      return 'text-danger-600 bg-danger-50 border-danger-200';
    case 'mixed':
      return 'text-warning-600 bg-warning-50 border-warning-200';
    case 'neutral':
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
}

/**
 * Return Tailwind color classes for a given customer status value.
 */
export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'active':
      return 'text-success-700 bg-success-50 border-success-200';
    case 'inactive':
      return 'text-gray-600 bg-gray-50 border-gray-200';
    case 'churned':
      return 'text-danger-700 bg-danger-50 border-danger-200';
    case 'at_risk':
      return 'text-warning-700 bg-warning-50 border-warning-200';
    case 'new':
      return 'text-primary-700 bg-primary-50 border-primary-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
}

/**
 * Truncate text to a maximum length, appending an ellipsis if truncated.
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '…';
}
