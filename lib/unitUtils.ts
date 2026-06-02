import type { Product } from '@/types';
import { stockQuantity } from './stockUtils';

export interface UnitInfo {
  piecesPerUnit: number;
  unitPrice: number;
  unitSellingPrice: number;
  unitStock: number;
  unitLabel: string;
  unitLabelPlural: string;
  totalPieces: number;
  sellsByStrip: boolean;
}

export const getUnitInfo = (item: Product | null | undefined): UnitInfo => {
  const totalPieces = stockQuantity(item) || Number(item?.stock || 0);

  const packQty = Number(
    item?.packsize_quantity || item?.product_prices?.pack_quantity || 1
  );
  const packSellingPrice = Number(
    item?.product_prices?.selling_price || item?.selling_price || 0
  );
  const discountPct = Number(
    item?.ecom_discount_percentage ??
      item?.product_prices?.ecom_discount_percentage ??
      0
  );
  const discountedFromPct =
    discountPct > 0 ? packSellingPrice * (1 - discountPct / 100) : 0;
  const packPrice =
    discountedFromPct > 0
      ? discountedFromPct
      : Number(item?.product_prices?.ecom_final_selling_price || item?.selling_price || 0);

  const perPiecePrice = packQty > 0 ? packPrice / packQty : 0;
  const perPieceSelling = packQty > 0 ? packSellingPrice / packQty : 0;

  const stripeQty = Number(item?.stripe_qty || 0);

  if (stripeQty > 0) {
    return {
      piecesPerUnit: stripeQty,
      unitPrice: perPiecePrice * stripeQty,
      unitSellingPrice: perPieceSelling * stripeQty,
      unitStock: Math.floor(totalPieces / stripeQty),
      unitLabel: 'strip',
      unitLabelPlural: 'strips',
      totalPieces,
      sellsByStrip: true,
    };
  }

  return {
    piecesPerUnit: 1,
    unitPrice: perPiecePrice,
    unitSellingPrice: perPieceSelling,
    unitStock: totalPieces,
    unitLabel: 'pcs',
    unitLabelPlural: 'pcs',
    totalPieces,
    sellsByStrip: false,
  };
};
