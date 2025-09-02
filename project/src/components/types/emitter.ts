// types/emitter.ts
import mitt from 'mitt';
import { CartItem } from './types';

type Events = {
  cartUpdated: CartItem;
  cartItemRemoved: number;
};

export const emitter = mitt<Events>();
