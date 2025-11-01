export const formatCurrency = (value?: number | null) => {
  if (value === null || value === undefined) return "-";

  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};
