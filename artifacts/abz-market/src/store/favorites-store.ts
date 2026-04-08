import { create } from "zustand";
import { persist } from "zustand/middleware";

interface FavoritesState {
  favorites: string[];
  toggle: (id: string) => void;
  isFavorite: (id: string) => boolean;
  count: () => number;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      toggle: (id) => {
        const cur = get().favorites;
        set({ favorites: cur.includes(id) ? cur.filter((f) => f !== id) : [...cur, id] });
      },
      isFavorite: (id) => get().favorites.includes(id),
      count: () => get().favorites.length,
    }),
    { name: "abz_favorites" }
  )
);
