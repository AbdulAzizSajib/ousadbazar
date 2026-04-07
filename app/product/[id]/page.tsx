import { apiBasePharma } from "@/lib/config";
import ProductDetailClient from "./ProductDetailClient";

interface ProductParam {
  id: string;
}

async function fetchProductIds(): Promise<string[]> {
  const ids = new Set<string>();

  for (let page = 1; page <= 10; page++) {
    try {
      const res = await fetch(
        `${apiBasePharma}/products/all-products-paginated?page=${page}&paginate=100`,
        { cache: "no-store" }
      );

      if (!res.ok) break;

      const data = await res.json();
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.products)
            ? data.products
            : [];

      if (list.length === 0) break;

      for (const item of list) {
        if (item?.id !== undefined && item?.id !== null) {
          ids.add(String(item.id));
        }
      }
    } catch {
      break;
    }
  }

  return Array.from(ids);
}

export async function generateStaticParams(): Promise<ProductParam[]> {
  const ids = await fetchProductIds();
  return ids.map((id) => ({ id }));
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<ProductParam>;
}) {
  const { id } = await params;
  return <ProductDetailClient id={id} />;
}
