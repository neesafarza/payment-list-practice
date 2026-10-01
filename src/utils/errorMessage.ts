import axios from "axios";
import { I18N } from "../constants/i18n";

export const getPaymentsErrorMessage = (error: unknown): string => {
  const status = axios.isAxiosError(error) ? error.response?.status : undefined;

  if (status === 404) return I18N.PAYMENT_NOT_FOUND;
  if (status !== undefined && status >= 500) return I18N.INTERNAL_SERVER_ERROR;
  return I18N.SOMETHING_WENT_WRONG;
};
