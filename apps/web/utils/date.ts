import { format } from "date-fns";

export const dateToString = (date: Date): string => {
  return format(new Date(date), "dd MMM yyyy");
};
