import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { apiBasePharma } from "@/lib/config";

export interface ApiCategory {
  id: string | number;
  name: string;
  short_order: number;
  ecom_cat_id: number;
  ecom_cat_name: string;
}

export const useCategories = () => {
  return useQuery<ApiCategory[]>({
    queryKey: ["all-category"],
    queryFn: async () => {
      const res = await axios.get(`${apiBasePharma}/all-category`);
      const list = Array.isArray(res?.data?.categories)
        ? res.data.categories
        : Array.isArray(res?.data)
          ? res.data
          : [];
      return list as ApiCategory[];
    },
    staleTime: 30 * 60 * 1000,
  });
};
