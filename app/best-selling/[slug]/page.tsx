import { apiBasePharma } from '@/lib/config';
import BestSellingClient from './BestSellingClient';

type ApiCategory = {
  id: string | number;
  name: string;
  short_order: number;
  ecom_cat_id: number;
  ecom_cat_name: string;
};

const toSlug = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

export async function generateStaticParams() {
  try {
    const res = await fetch(`${apiBasePharma}/all-category`, { cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    const list: ApiCategory[] = Array.isArray(json?.categories)
      ? json.categories
      : Array.isArray(json)
        ? json
        : [];

    const seen = new Map<number | string, { id: number | string; name: string }>();
    for (const cat of list) {
      if (!cat?.ecom_cat_id || !cat?.ecom_cat_name) continue;
      if (!seen.has(cat.ecom_cat_id)) {
        seen.set(cat.ecom_cat_id, { id: cat.ecom_cat_id, name: cat.ecom_cat_name });
      }
    }

    return Array.from(seen.values()).map(({ id, name }) => ({
      slug: `${toSlug(name)}-${id}`,
    }));
  } catch (error) {
    console.error('generateStaticParams (best-selling/[slug]) failed:', error);
    return [];
  }
}

export default function BestSellingSlugPage() {
  return <BestSellingClient />;
}
