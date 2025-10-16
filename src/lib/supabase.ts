import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserType = 'farmer' | 'retailer';

export interface Profile {
  id: string;
  user_type: UserType;
  full_name: string;
  phone?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  bio?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  farmer_id: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  unit: string;
  quantity_available: number;
  image_url?: string;
  location?: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
}

export interface Order {
  id: string;
  product_id: string;
  retailer_id: string;
  farmer_id: string;
  quantity: number;
  total_price: number;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  payment_method: 'online' | 'cash_on_delivery';
  delivery_address: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  products?: Product;
  retailer?: Profile;
  farmer?: Profile;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  product_id?: string;
  message: string;
  is_read: boolean;
  created_at: string;
  sender?: Profile;
  receiver?: Profile;
}
