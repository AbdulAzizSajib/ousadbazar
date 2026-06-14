export const apiBasePharma = "https://ec.mis.digital/api";

// basePath prefix for static assets in public/ folder.
// Plain <img> and <link> tags don't get auto-prefixed by Next.js, only next/image does.
export const basePath = "";
export const asset = (path: string) => `${basePath}${path.startsWith("/") ? path : `/${path}`}`;

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
