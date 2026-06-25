import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import axios from "axios";
import { apiBasePharma, getTokenConfig } from "@/lib/config";
import type { Order } from "@/types";

interface OrderListResponse {
  data: Order[];
  total?: number;
  current_page?: number;
  last_page?: number;
}

export const useOrderList = (page: number = 1, paginate: number = 15) => {
  return useQuery<OrderListResponse>({
    queryKey: ["orderList", page, paginate],
    queryFn: async () => {
      const res = await axios.get(
        `${apiBasePharma}/all-order-list-paginated?page=${page}&search=&paginate=${paginate}`,
        getTokenConfig()
      );
      return res.data ?? { data: [] };
    },
    staleTime: 30 * 1000,
  });
};

export const useOrderHistory = (
  phone: string | undefined | null,
  enabled: boolean = true
) => {
  return useQuery<Order[]>({
    queryKey: ["orderHistory", phone],
    queryFn: async () => {
      const fullPhone = String(phone).startsWith("88")
        ? String(phone).trim()
        : `88${String(phone).trim()}`;
      const res = await axios.get(
        `${apiBasePharma}/order/history?phone=${fullPhone}`
      );
      return Array.isArray(res.data) ? res.data : [];
    },
    enabled: enabled && !!phone && !!String(phone).trim(),
    staleTime: 0,
    refetchOnMount: "always",
  });
};

interface TrackingErrorResponse {
  status: "error";
  message?: string;
}

export const useOrderTracking = (
  id: string | undefined | null,
  enabled: boolean = true
) => {
  return useQuery<Order, Error>({
    queryKey: ["orderTracking", id],
    queryFn: async () => {
      const res = await axios.get(
        `${apiBasePharma}/order/order-tracking?id=${String(id).trim()}`
      );
      const data = res.data as Order | TrackingErrorResponse;
      if (data && (data as TrackingErrorResponse).status === "error") {
        throw new Error(
          (data as TrackingErrorResponse).message || "Order not found."
        );
      }
      return data as Order;
    },
    enabled: enabled && !!id && !!String(id).trim(),
    retry: false,
    staleTime: 30 * 1000,
  });
};

export interface CreateOrderPayload {
  sale_products: Array<Record<string, unknown>>;
  sub_total: number;
  total: number;
  phone: string;
  shipping_cost: number;
  billing_address: Record<string, unknown>;
  user: { id: number };
  payment_method_id: number;
}

export interface CreateOrderResponse {
  message?: string;
  saleCode?: string;
  sale_code?: string;
}

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation<CreateOrderResponse, unknown, CreateOrderPayload>({
    mutationFn: async (payload) => {
      const res = await axios.post(
        `${apiBasePharma}/order/create-order`,
        payload,
        getTokenConfig()
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orderList"] });
      queryClient.invalidateQueries({
        queryKey: ["orderHistory"],
        refetchType: "all",
      });
    },
  });
};

export interface BillingAddressByPhone {
  id: string;
  sale_id?: string;
  full_name: string;
  mobile: string;
  address: string;
  country_id: string;
  city_id: string;
  area_id: string;
  notes?: string;
  customer_address_id?: string | null;
}

interface BillingAddressByPhoneResponse {
  success: boolean;
  categories: BillingAddressByPhone | null;
}

export const useBillingAddressByPhone = (
  mobile: string | undefined | null
) => {
  return useQuery<BillingAddressByPhone | null>({
    queryKey: ["billingAddressByPhone", mobile],
    queryFn: async () => {
      const res = await axios.get<BillingAddressByPhoneResponse>(
        `${apiBasePharma}/billing_address/by-phone?mobile=${mobile}`
      );
      return res.data?.success ? res.data?.categories ?? null : null;
    },
    enabled: !!mobile && /^01\d{9}$/.test(String(mobile)),
    staleTime: 5 * 60 * 1000,
  });
};

export interface SuspendOrderResponse {
  message: string;
}

export const useSuspendOrder = () => {
  const queryClient = useQueryClient();
  return useMutation<SuspendOrderResponse, unknown, number>({
    mutationFn: async (id) => {
      const res = await axios.post(
        `${apiBasePharma}/sale/request-to-suspend/${id}`
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orderList"] });
    },
  });
};

export const useCancelOrder = () => {
  const queryClient = useQueryClient();
  return useMutation<SuspendOrderResponse, unknown, number | string>({
    mutationFn: async (id) => {
      const res = await axios.put(
        `${apiBasePharma}/order/suspend-request?id=${id}`
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orderHistory"] });
      queryClient.invalidateQueries({ queryKey: ["orderTracking"] });
    },
  });
};
