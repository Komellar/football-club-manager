export type ActionResult<T = unknown> = {
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};
