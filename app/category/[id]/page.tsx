import { apiBasePharma } from '@/lib/config';
import CategoryClient from './CategoryClient';

export const dynamicParams = false;

export async function generateStaticParams() {
  try {
    const res = await fetch(`${apiBasePharma}/all-category`, { cache: 'no-store' });
    if (!res.ok) return [{ id: '0' }];
    const json = await res.json();
    const list = Array.isArray(json?.categories) ? json.categories : Array.isArray(json) ? json : [];
    const params = list.map((cat: { id: string | number }) => ({ id: String(cat.id) }));
    return params.length > 0 ? params : [{ id: '0' }];
  } catch {
    return [{ id: '0' }];
  }
}

export default function CategoryPage() {
  return <CategoryClient />;
}
