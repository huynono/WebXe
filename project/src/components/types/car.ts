// types/car.ts
export interface Car {
  id: number;
  name: string;
  brand?: string;
  year?: number;
  slug?: string;
  price?: number;
  km?: number;
  seats?: number;
  fuelType?: string;
  category?: string;
  image: string; // ảnh chính
  images?: { url: string }[]; // ảnh phụ
  isActive?: boolean | string | number; 
}

export interface FilterState {
  category: string;
  minYear: number;
  maxYear: number;
  minPrice: number;
  maxPrice: number;
  fuel: string;
  seats: string;
  maxKm: number;
}
