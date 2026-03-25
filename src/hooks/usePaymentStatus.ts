export type PaymentStatus = 'Paid' | 'Pending' | 'Overdue' | 'Partial';

interface StatusConfig {
  label: string;
  color: string;
  bg: string;
  border: string;
}

const statusMap: Record<PaymentStatus, StatusConfig> = {
  Paid:    { label: 'Paid',    color: '#10B981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.25)' },
  Pending: { label: 'Pending', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)' },
  Overdue: { label: 'Overdue', color: '#EF4444', bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.25)' },
  Partial: { label: 'Partial', color: '#818CF8', bg: 'rgba(129,140,248,0.12)', border: 'rgba(129,140,248,0.25)' },
};

export function usePaymentStatus(status: PaymentStatus) {
  return statusMap[status] ?? statusMap.Pending;
}

export function getStatusClass(status: string) {
  switch (status) {
    case 'Paid':    return 'status-paid';
    case 'Overdue': return 'status-overdue';
    case 'Partial': return 'status-partial';
    default:        return 'status-pending';
  }
}
