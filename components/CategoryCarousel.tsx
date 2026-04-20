'use client';

import Link from 'next/link';
import { Icon } from '@iconify/react';

export type Category = {
  id: number | string;
  name: string;
  icon: string;
  color: string;
  href?: string;
};

const defaultCategories: Category[] = [
  { id: 1,  name: 'Medicine',        icon: 'mdi:pill',                color: 'text-rose-400',     href: '/category/medicine' },
  { id: 2,  name: 'Vitamins',        icon: 'mdi:food-apple',          color: 'text-orange-400',   href: '/category/vitamins' },
  { id: 3,  name: 'Personal Care',   icon: 'mdi:face-woman-shimmer',  color: 'text-pink-400',     href: '/category/personal-care' },
  { id: 4,  name: 'Baby Care',       icon: 'mdi:baby-face-outline',   color: 'text-sky-400',      href: '/category/baby-care' },
  { id: 5,  name: 'Devices',         icon: 'mdi:stethoscope',         color: 'text-emerald-400',  href: '/category/devices' },
  { id: 6,  name: 'Diabetes',        icon: 'mdi:water',               color: 'text-blue-400',     href: '/category/diabetes' },
  { id: 7,  name: 'First Aid',       icon: 'mdi:medical-bag',         color: 'text-red-400',      href: '/category/first-aid' },
  { id: 8,  name: 'Nutrition',       icon: 'mdi:nutrition',           color: 'text-lime-500',     href: '/category/nutrition' },
  { id: 9,  name: 'Herbal',          icon: 'mdi:leaf',                color: 'text-green-500',    href: '/category/herbal' },
  { id: 10, name: 'Sexual Wellness', icon: 'mdi:heart-pulse',         color: 'text-purple-400',   href: '/category/sexual-wellness' },
  { id: 11, name: 'Home Care',       icon: 'mdi:home-heart',          color: 'text-amber-400',    href: '/category/home-care' },
  { id: 12, name: 'Eye Care',        icon: 'mdi:eye',                 color: 'text-cyan-400',     href: '/category/eye-care' },
];

interface CategoryCarouselProps {
  categories?: Category[];
  title?: string;
}

export default function CategoryCarousel({
  categories = defaultCategories,
  title = 'Feature Category',
}: CategoryCarouselProps) {
  return (
    <div className="mt-16 mb-8">
      <div className="flex justify-between items-center mb-4 text-primary">
        <h2 className="md:text-2xl font-bold text-black capitalize">{title}</h2>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 md:gap-4">
        {categories.map((cat) => {
          const card = (
            <div className="group flex flex-col border border-gray-200  items-center justify-center gap-3 py-6 md:py-8 px-3 bg-[#f4f5f9]  hover:bg-gray-100 rounded-xl transition-colors cursor-pointer">
              <Icon
                icon={cat.icon}
                className={`${cat.color} group-hover:scale-110 transition-transform duration-300`}
                width={40}
                height={40}
              />
              <span className="text-xs md:text-sm font-medium text-gray-700 text-center line-clamp-1">
                {cat.name}
              </span>
            </div>
          );
          return cat.href ? (
            <Link key={cat.id} href={cat.href}>
              {card}
            </Link>
          ) : (
            <div key={cat.id}>{card}</div>
          );
        })}
      </div>
    </div>
  );
}
