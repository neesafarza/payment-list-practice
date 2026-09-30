import axios from "axios";
import { API_URL } from "../constants";
import type { PaymentSearchResponse } from "../types/payment";

export interface PaymentSearchParams {
  search?: string;
  page: number;
  pageSize: number;
}

export const fetchPayments = async (
  params: PaymentSearchParams
): Promise<PaymentSearchResponse> => {
  const response = await axios.get<PaymentSearchResponse>(API_URL, { params });
  return response.data;
};
