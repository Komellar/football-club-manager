export function updateFilter<T extends object, K extends keyof T>(
  setLocalFilters: React.Dispatch<React.SetStateAction<Partial<T>>>,
  key: K,
  value: T[K] | undefined
) {
  setLocalFilters((prev) => ({ ...prev, [key]: value }));
}
