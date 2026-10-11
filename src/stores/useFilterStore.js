import { create } from 'zustand';

export const useFilterStore = create((set) => ({
  selectedCategory: 'ALL',
  searchQuery: '',
  sortBy: 'DEFAULT', // 'DEFAULT' | 'PRICE_LOW_HIGH' | 'PRICE_HIGH_LOW' | 'NEWEST'

  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSortBy: (sortBy) => set({ sortBy }),

  resetFilters: () =>
    set({
      selectedCategory: 'ALL',
      searchQuery: '',
      sortBy: 'DEFAULT',
    }),
}));