import { format, isValid } from "date-fns";

const DATE_FORMAT = "dd/MM/yyyy, HH:mm:ss";

export const formatDate = (iso: string): string => {
  const date = new Date(iso);
  // date-fns format() throws on an invalid date; show the raw value instead.
  return isValid(date) ? format(date, DATE_FORMAT) : iso;
};

export const formatAmount = (amount: number): string => amount.toFixed(2);
