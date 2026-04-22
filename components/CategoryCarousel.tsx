'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useCategories } from '@/lib/hooks/useCategories';

type IllustrationProps = { className?: string };

const PillBottleArt = ({ className }: IllustrationProps) => (
  <svg viewBox="0 0 64 64" className={className} xmlns="http://www.w3.org/2000/svg">
    <rect x="18" y="10" width="28" height="8" rx="2" fill="#012068" />
    <rect x="14" y="18" width="36" height="40" rx="6" fill="#ffffff" stroke="#012068" strokeWidth="2" />
    <rect x="20" y="28" width="24" height="4" rx="2" fill="#5360A7" />
    <circle cx="26" cy="44" r="3" fill="#f59e0b" />
    <circle cx="36" cy="48" r="3" fill="#ef4444" />
    <circle cx="32" cy="40" r="2.5" fill="#10b981" />
  </svg>
);

const CapsuleArt = ({ className }: IllustrationProps) => (
  <svg viewBox="0 0 64 64" className={className} xmlns="http://www.w3.org/2000/svg">
    <g transform="rotate(-35 32 32)">
      <rect x="12" y="24" width="40" height="16" rx="8" fill="#f59e0b" stroke="#012068" strokeWidth="2" />
      <rect x="12" y="24" width="20" height="16" rx="8" fill="#fbbf24" stroke="#012068" strokeWidth="2" />
      <circle cx="20" cy="29" r="1.5" fill="#ffffff" opacity="0.8" />
      <circle cx="26" cy="32" r="1" fill="#ffffff" opacity="0.8" />
    </g>
    <circle cx="12" cy="14" r="2" fill="#012068" opacity="0.3" />
    <circle cx="54" cy="50" r="1.5" fill="#f59e0b" opacity="0.6" />
  </svg>
);

const SparkleBottleArt = ({ className }: IllustrationProps) => (
  <svg viewBox="0 0 64 64" className={className} xmlns="http://www.w3.org/2000/svg">
    <rect x="22" y="8" width="12" height="8" rx="2" fill="#012068" />
    <path d="M18 18 L38 18 L42 56 Q42 58 40 58 L16 58 Q14 58 14 56 Z" fill="#ec4899" />
    <path d="M18 18 L38 18 L39 28 L17 28 Z" fill="#f9a8d4" />
    <path d="M22 36 L28 36" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
    <path d="M22 42 L32 42" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
    <path d="M50 14 L50 22 M46 18 L54 18" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
    <path d="M48 44 L48 48 M46 46 L50 46" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const BabyBottleArt = ({ className }: IllustrationProps) => (
  <svg viewBox="0 0 64 64" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M26 8 Q26 4 32 4 Q38 4 38 8 L38 14 L26 14 Z" fill="#f9a8d4" />
    <rect x="22" y="14" width="20" height="6" rx="2" fill="#012068" />
    <path d="M20 22 L44 22 L42 56 Q42 58 40 58 L24 58 Q22 58 22 56 Z" fill="#ffffff" stroke="#0ea5e9" strokeWidth="2" />
    <path d="M22 34 L42 34 L42 56 Q42 58 40 58 L24 58 Q22 58 22 56 Z" fill="#bae6fd" />
    <circle cx="28" cy="42" r="1.5" fill="#ffffff" />
    <circle cx="36" cy="48" r="1" fill="#ffffff" />
    <text x="26" y="30" fontSize="6" fill="#012068" fontWeight="bold">ml</text>
  </svg>
);

const StethoscopeArt = ({ className }: IllustrationProps) => (
  <svg viewBox="0 0 64 64" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M14 12 L14 30 Q14 40 24 40 Q34 40 34 30 L34 12" stroke="#012068" strokeWidth="3" fill="none" strokeLinecap="round" />
    <circle cx="14" cy="10" r="3" fill="#5360A7" />
    <circle cx="34" cy="10" r="3" fill="#5360A7" />
    <path d="M24 40 L24 48" stroke="#012068" strokeWidth="2" />
    <circle cx="24" cy="50" r="4" fill="#10b981" />
    <circle cx="48" cy="50" r="8" fill="#012068" />
    <circle cx="48" cy="50" r="5" fill="#5360A7" />
    <path d="M24 50 Q36 50 44 50" stroke="#012068" strokeWidth="2" fill="none" />
  </svg>
);

const DropletArt = ({ className }: IllustrationProps) => (
  <svg viewBox="0 0 64 64" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M32 6 Q18 26 18 40 Q18 52 32 52 Q46 52 46 40 Q46 26 32 6 Z" fill="#ef4444" />
    <path d="M32 14 Q24 28 24 38" stroke="#ffffff" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6" />
    <rect x="40" y="44" width="18" height="12" rx="2" fill="#012068" />
    <rect x="42" y="46" width="14" height="6" rx="1" fill="#ffffff" />
    <text x="44" y="51" fontSize="5" fill="#012068" fontWeight="bold">5.8</text>
  </svg>
);

const FirstAidArt = ({ className }: IllustrationProps) => (
  <svg viewBox="0 0 64 64" className={className} xmlns="http://www.w3.org/2000/svg">
    <rect x="22" y="14" width="20" height="6" rx="2" fill="#012068" />
    <rect x="8" y="20" width="48" height="36" rx="4" fill="#ef4444" />
    <rect x="8" y="20" width="48" height="8" rx="4" fill="#b91c1c" />
    <rect x="28" y="30" width="8" height="20" rx="2" fill="#ffffff" />
    <rect x="18" y="36" width="28" height="8" rx="2" fill="#ffffff" />
  </svg>
);

const NutritionArt = ({ className }: IllustrationProps) => (
  <svg viewBox="0 0 64 64" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M8 32 Q8 48 32 48 Q56 48 56 32 Z" fill="#ffffff" stroke="#012068" strokeWidth="2" />
    <ellipse cx="32" cy="32" rx="24" ry="4" fill="#012068" />
    <circle cx="22" cy="28" r="5" fill="#f59e0b" />
    <circle cx="32" cy="26" r="4" fill="#10b981" />
    <circle cx="42" cy="28" r="5" fill="#ef4444" />
    <path d="M30 22 Q32 18 34 22" stroke="#065f46" strokeWidth="1.5" fill="none" strokeLinecap="round" />
  </svg>
);

const HerbalArt = ({ className }: IllustrationProps) => (
  <svg viewBox="0 0 64 64" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M32 8 Q14 18 14 34 Q14 48 32 54 Q50 48 50 34 Q50 18 32 8 Z" fill="#10b981" />
    <path d="M32 8 Q32 30 32 54" stroke="#065f46" strokeWidth="1.5" fill="none" />
    <path d="M32 20 Q22 22 18 28" stroke="#065f46" strokeWidth="1.5" fill="none" />
    <path d="M32 20 Q42 22 46 28" stroke="#065f46" strokeWidth="1.5" fill="none" />
    <path d="M32 36 Q22 38 18 44" stroke="#065f46" strokeWidth="1.5" fill="none" />
    <path d="M32 36 Q42 38 46 44" stroke="#065f46" strokeWidth="1.5" fill="none" />
    <circle cx="50" cy="14" r="3" fill="#fbbf24" />
  </svg>
);

const HeartPulseArt = ({ className }: IllustrationProps) => (
  <svg viewBox="0 0 64 64" className={className} xmlns="http://www.w3.org/2000/svg">
    <path
      d="M32 54 Q8 40 8 24 Q8 14 18 14 Q26 14 32 22 Q38 14 46 14 Q56 14 56 24 Q56 40 32 54 Z"
      fill="#ec4899"
    />
    <path
      d="M14 32 L22 32 L26 24 L32 40 L38 28 L42 32 L50 32"
      stroke="#ffffff"
      strokeWidth="2.5"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const HouseCareArt = ({ className }: IllustrationProps) => (
  <svg viewBox="0 0 64 64" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M8 30 L32 10 L56 30 L56 54 Q56 56 54 56 L10 56 Q8 56 8 54 Z" fill="#fbbf24" />
    <path d="M8 30 L32 10 L56 30 L52 30 L32 14 L12 30 Z" fill="#f59e0b" />
    <rect x="26" y="38" width="12" height="18" rx="1" fill="#012068" />
    <rect x="14" y="36" width="8" height="8" rx="1" fill="#ffffff" />
    <rect x="42" y="36" width="8" height="8" rx="1" fill="#ffffff" />
    <path
      d="M32 22 Q28 24 28 28 Q28 32 32 34 Q36 32 36 28 Q36 24 32 22 Z"
      fill="#ef4444"
    />
  </svg>
);

const EyeCareArt = ({ className }: IllustrationProps) => (
  <svg viewBox="0 0 64 64" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M6 32 Q18 16 32 16 Q46 16 58 32 Q46 48 32 48 Q18 48 6 32 Z" fill="#ffffff" stroke="#012068" strokeWidth="2" />
    <circle cx="32" cy="32" r="10" fill="#06b6d4" />
    <circle cx="32" cy="32" r="5" fill="#012068" />
    <circle cx="34" cy="30" r="1.5" fill="#ffffff" />
    <path d="M10 20 L14 18 M50 18 L54 20" stroke="#012068" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export type Category = {
  id: number | string;
  name: string;
  art: (props: IllustrationProps) => React.JSX.Element;
  href?: string;
};

const artRotation: ((props: IllustrationProps) => React.JSX.Element)[] = [
  PillBottleArt,
  CapsuleArt,
  SparkleBottleArt,
  BabyBottleArt,
  StethoscopeArt,
  DropletArt,
  FirstAidArt,
  NutritionArt,
  HerbalArt,
  HeartPulseArt,
  HouseCareArt,
  EyeCareArt,
];

interface CategoryCarouselProps {
  categories?: Category[];
  title?: string;
  subtitle?: string;
  viewAllHref?: string;
}

export default function CategoryCarousel({
  categories,
  title = 'Shop By Category',
  subtitle = 'Find exactly what your family needs',
  viewAllHref = '/categories',
}: CategoryCarouselProps) {
  const { data: apiCategories = [] } = useCategories();

  const resolvedCategories = useMemo<Category[]>(() => {
    if (categories && categories.length > 0) return categories;

    const seen = new Map<number | string, { id: number | string; name: string }>();
    for (const cat of apiCategories) {
      if (!cat?.ecom_cat_id || !cat?.ecom_cat_name) continue;
      if (!seen.has(cat.ecom_cat_id)) {
        seen.set(cat.ecom_cat_id, { id: cat.ecom_cat_id, name: cat.ecom_cat_name });
      }
    }

    return Array.from(seen.values()).map((parent, idx) => ({
      id: parent.id,
      name: parent.name,
      art: artRotation[idx % artRotation.length],
      href: `/search?q=${encodeURIComponent(parent.name)}`,
    }));
  }, [categories, apiCategories]);
  return (
    <section className="mt-10 md:mt-16 mb-6 md:mb-10">
      {/* Section header */}
      <div className="flex items-end justify-between gap-3 mb-5 md:mb-7">
        <div className="flex items-center gap-3">
          <span className="block w-1 h-8 md:h-10 rounded-full bg-gradient-to-b from-[#5360A7] to-[#012068]" />
          <div>
            <h2 className="text-base sm:text-lg md:text-2xl font-bold text-gray-900 capitalize leading-tight">
              {title}
            </h2>
            <p className="text-[11px] sm:text-xs md:text-sm text-gray-500 mt-0.5">
              {subtitle}
            </p>
          </div>
        </div>

        {/* <Link
          href={viewAllHref}
          className="group shrink-0 inline-flex items-center gap-1 text-xs sm:text-sm md:text-base font-semibold text-[#012068] hover:text-[#5360A7] transition-colors"
        >
          <span className="hidden sm:inline">View All</span>
          <span className="sm:hidden">All</span>
          <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4 transition-transform duration-300 group-hover:translate-x-1" />
        </Link> */}
      </div>

      {/* Category grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5 sm:gap-3 md:gap-4">
        {resolvedCategories.map((cat) => {
          const card = (
            <div className="group relative overflow-hidden flex flex-col items-center justify-center gap-2 sm:gap-3 py-4 sm:py-5 md:py-6 px-2 sm:px-3 rounded-xl sm:rounded-2xl bg-white ring-1 ring-[#012068]/10 hover:ring-[#012068]/30 shadow-sm hover:shadow-[0_10px_30px_-10px_rgba(1,32,104,0.35)] hover:-translate-y-1 transition-all duration-300 cursor-pointer">
              {/* Decorative accent */}
              <span className="pointer-events-none absolute -top-8 -right-8 w-20 h-20 rounded-full bg-[#012068]/5 blur-2xl group-hover:bg-[#012068]/15 transition-colors duration-500" />
              <span className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-[#012068]/0 to-transparent group-hover:via-[#012068]/40 transition-colors duration-500" />

              {/* Illustration tile */}
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 md:w-[72px] md:h-[72px] rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#eef0fb] to-[#dde2f6] flex items-center justify-center ring-1 ring-[#012068]/10 group-hover:ring-[#012068]/25 group-hover:scale-105 transition-all duration-300">
                <cat.art className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12" />
              </div>

              {/* Label */}
              <span className="relative text-[11px] sm:text-xs md:text-sm font-semibold text-gray-700 group-hover:text-[#012068] text-center line-clamp-1 tracking-tight transition-colors">
                {cat.name}
              </span>
            </div>
          );
          return cat.href ? (
            <Link key={cat.id} href={cat.href} className="block">
              {card}
            </Link>
          ) : (
            <div key={cat.id}>{card}</div>
          );
        })}
      </div>
    </section>
  );
}
