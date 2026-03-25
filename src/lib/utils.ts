import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = '₹') {
  return `${currency}${amount.toLocaleString('en-IN')}`;
}

export function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
}

export function getDaysOverdue(dueDate: string) {
  const diff = Date.now() - new Date(dueDate).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}
