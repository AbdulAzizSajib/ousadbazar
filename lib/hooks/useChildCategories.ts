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

export const useChildCategories = (parentId: string | number) => {
  return useQuery<ApiCategory[]>({
    queryKey: ["child-categories", parentId],
    queryFn: async () => {
      const res = await axios.get(`${apiBasePharma}/all-category/${parentId}`);
      const list = Array.isArray(res?.data?.data)
        ? res.data.data
        : Array.isArray(res?.data)
          ? res.data
          : [];
      return list as ApiCategory[];
    },
    enabled: !!parentId,
    staleTime: 30 * 60 * 1000,
  });
};
