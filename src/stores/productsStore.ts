import { create } from 'zustand';
import type { Category, Product } from '../data/catalog';
import { categories as catalogCategories, products as catalogProducts } from '../data/catalog';

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface ProductsState {
  products: Product[];
  categories: Category[];
  loading: boolean;
  selectedCategory: string | null;
  searchTerm: string;
  fetchProducts: (categorySlug?: string | null) => Promise<void>;
  fetchCategories: () => Promise<void>;
  setSelectedCategory: (categorySlug: string | null) => void;
  setSearchTerm: (term: string) => void;
  getFilteredProducts: () => Product[];
}

export const useProductsStore = create<ProductsState>((set, get) => ({
  products: catalogProducts,
  categories: catalogCategories,
  loading: false,
  selectedCategory: null,
  searchTerm: '',

  fetchProducts: async (categorySlug) => {
    set({ loading: true });
    await wait(120);

    set((state) => {
      const nextCategory = categorySlug ?? state.selectedCategory;
      const categoryId = nextCategory
        ? catalogCategories.find((cat) => cat.slug === nextCategory)?.id ?? null
        : null;

      const visibleProducts = categoryId
        ? catalogProducts.filter((product) => product.categoryId === categoryId)
        : catalogProducts;

      return {
        products: visibleProducts,
        selectedCategory: nextCategory,
        loading: false,
      };
    });
  },

  fetchCategories: async () => {
    set({ categories: catalogCategories });
  },

  setSelectedCategory: (categorySlug) => {
    set({ selectedCategory: categorySlug });
  },

  setSearchTerm: (term) => {
    set({ searchTerm: term });
  },

  getFilteredProducts: () => {
    const { products, searchTerm } = get();

    if (!searchTerm.trim()) {
      return products;
    }

    const term = searchTerm.toLowerCase();
    return products.filter((product) =>
      product.name.toLowerCase().includes(term) ||
      product.brand.toLowerCase().includes(term) ||
      product.model.toLowerCase().includes(term) ||
      product.description.toLowerCase().includes(term)
    );
  },
}));