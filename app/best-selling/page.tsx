import { Suspense } from 'react';
import BestSellingContent from './BestSellingContent';

export default function BestSellingPage() {
  return (
    <Suspense>
      <BestSellingContent />
    </Suspense>
  );
}
