export type PaymentStatus = "completed" | "pending" | "failed" | "refunded";

export interface Payment {
  id: string;
  customerName: string;
  amount: number;
  customerAddress: string;
  currency: string;
  status: PaymentStatus;
  date: string;
  description: string;
  clientId?: string;
}

export interface PaymentSearchResponse {
  payments: Payment[];
  total: number;
  page: number;
  pageSize: number;
}
