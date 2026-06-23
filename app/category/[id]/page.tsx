import CategoryClient from './CategoryClient';

type ApiCategory = {
  id: string | number;
};

export async function generateStaticParams() {
  try {
    const res = await fetch('https://ec.mis.digital/api1/all-category', { cache: 'no-store' });
    if (!res.ok) return [{ id: '0' }];
    const json = await res.json();
    const list: ApiCategory[] = Array.isArray(json?.categories)
      ? json.categories
      : Array.isArray(json)
        ? json
        : [];
    return list.map((cat) => ({ id: String(cat.id) }));
  } catch {
    return [{ id: '0' }];
  }
}

export default function CategoryPage() {
  return <CategoryClient />;
}
