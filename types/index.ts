export interface ProductImage {
  path: string;
}

export interface ProductPrices {
  selling_price: number;
  ecom_final_selling_price: number;
  ecom_discount_percentage: number | null;
  pack_quantity: number;
  ecom_pack_name?: { name: string };
  pack_size_id?: string;
}

export interface StockBatch {
  balanced_quantity: number;
}

export interface Category {
  id?: number;
  name: string;
}

export interface Supplier {
  id?: number;
  company_name: string;
}

export interface Product {
  id: number | string;
  name: string;
  generic_name?: string;
  category_name?: string;
  category_id?: number;
  company_name?: string;
  supplier_id?: number;
  category?: Category;
  supplier?: Supplier;
  product_prices?: ProductPrices;
  product_images?: ProductImage[];
  path?: string;
  stock_batches?: StockBatch[];
  selling_price?: number;
  balanced_quantity?: number;
  stock?: number;
  quantity?: number;
  packsize?: string;
  tp?: number;
  generic_id?: number;
  vat_percent?: number;
  ecom_final_selling_price?: number;
  ecom_discount_percentage?: number | null;
  pack_size?: { id: string; quantity: number };
  packsize_quantity?: number; // ← এটা add করো
  packsize_name?: string; // ← এটা add করো
  stripe_qty?: number | string; // pieces per strip (0/undefined = sell per piece)
}

export interface CartProduct extends Product {
  quantity: number;
  singleQty: number;
  total_quantity: number;
  price: number;
  total_price: number;
  total_previous_price: number;
  selectedQuantity: number;
  piecesPerUnit?: number;
  unitLabel?: string;
}

export interface OrderProduct {
  id?: number;
  product_id: string;
  product_name: string;
  name?: string;
  price: number;
  quantity: number;
  total_quantity?: number;
  total: number;
  ecom_final_selling_price?: number;
  ecom_discount_percentage?: number;
}

export interface BillingAddress {
  full_name: string;
  mobile: string;
  address: string;
  country_id: number;
  city_id: number;
  area_id: number;
  note: string;
}

export interface PaymentMethod {
  id: number;
  name: string;
}

export interface Order {
  id: number;
  sale_code: string;
  sale_date: string;
  created_at?: string;
  total: number;
  paid_amount?: string;
  verify_status: number | null;
  delivery_status: number | null;
  sale_products: OrderProduct[];
  payment_method?: PaymentMethod;
  billing_address?: BillingAddress;
  products?: OrderProduct[];
}

export interface User {
  id: number;
  name?: string;
  email?: string;
  phone?: string;
}
