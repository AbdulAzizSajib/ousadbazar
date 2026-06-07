import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SearchState {
  searchQuery: string;
  searchHistory: string[];
  search: (query: string) => void;
  saveSearchHistory: (query: string) => void;
  removeSearchHistory: (query: string) => void;
  clearSearchHistory: () => void;
  clearSearch: () => void;
}

export const useSearchStore = create<SearchState>()(
  persist(
    (set) => ({
      searchQuery: "",
      searchHistory: [],
      search: (query) => set({ searchQuery: query }),
      saveSearchHistory: (query) => {
        const normalized = query.trim();
        if (!normalized) return;

        set((state) => ({
          searchHistory: [
            normalized,
            ...state.searchHistory.filter((item) => item.toLowerCase() !== normalized.toLowerCase()),
          ].slice(0, 8),
        }));
      },
      removeSearchHistory: (query) =>
        set((state) => ({
          searchHistory: state.searchHistory.filter(
            (item) => item.toLowerCase() !== query.toLowerCase()
          ),
        })),
      clearSearchHistory: () => set({ searchHistory: [] }),
      clearSearch: () => set({ searchQuery: "" }),
    }),
    {
      name: "search-store",
      partialize: (state) => ({ searchHistory: state.searchHistory }),
    }
  )
);
