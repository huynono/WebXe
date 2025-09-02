export type CartItem = {
  cartItemId: number;  // ID thực từ DB
  id: number;          // product.id
  name: string;
  price: number;
  quantity: number;
  image: string;
  category: string;
  year: number;
  km?: number;
  fuelType?: string;
  seats?: number;
  color: string;
};
