import { useQuery } from "@tanstack/react-query";
import { fetchPayments, type PaymentSearchParams } from "../api/payments";

export const usePayments = (params: PaymentSearchParams) =>
  useQuery({
    queryKey: ["payments", params],
    queryFn: () => fetchPayments(params),
  });
