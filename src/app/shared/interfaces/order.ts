import { Product } from './product';

export interface Order {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  items: Product[];
  totalPrice: number;
  date: string;
  status: 'pending' | 'completed' | 'cancelled';
}