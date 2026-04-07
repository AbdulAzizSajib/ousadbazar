export const apiBasePharma = "https://ec.mis.digital/api";

export const imgBasePharma =
  "https://ecommerce-pharma.s3.ap-southeast-1.amazonaws.com";

export function formatNumber(number: number): string {
  const isInteger = Number.isInteger(number);
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: isInteger ? 0 : 2,
    maximumFractionDigits: isInteger ? 0 : 2,
  }).format(number);
}

export const getTokenConfig = () => {
  if (typeof window === "undefined") return { headers: {} };
  const token = localStorage.getItem("token") || "";
  return { headers: { Authorization: `Bearer ${token}` } };
};
