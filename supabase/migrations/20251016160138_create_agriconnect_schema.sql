/*
  # AgriConnect Database Schema

  ## Overview
  Complete database schema for AgriConnect platform connecting farmers with retailers.

  ## New Tables

  ### 1. profiles
  User profile information extending Supabase auth.users
  - `id` (uuid, primary key, references auth.users)
  - `user_type` (text) - 'farmer' or 'retailer'
  - `full_name` (text)
  - `phone` (text)
  - `location` (text)
  - `latitude` (numeric)
  - `longitude` (numeric)
  - `bio` (text)
  - `avatar_url` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. products
  Product listings created by farmers
  - `id` (uuid, primary key)
  - `farmer_id` (uuid, references profiles)
  - `name` (text)
  - `description` (text)
  - `category` (text)
  - `price` (numeric)
  - `unit` (text) - 'kg', 'ton', 'piece', etc.
  - `quantity_available` (numeric)
  - `image_url` (text)
  - `location` (text)
  - `is_available` (boolean)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 3. orders
  Orders placed by retailers
  - `id` (uuid, primary key)
  - `product_id` (uuid, references products)
  - `retailer_id` (uuid, references profiles)
  - `farmer_id` (uuid, references profiles)
  - `quantity` (numeric)
  - `total_price` (numeric)
  - `status` (text) - 'pending', 'accepted', 'rejected', 'completed'
  - `payment_method` (text) - 'online', 'cash_on_delivery'
  - `delivery_address` (text)
  - `notes` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 4. messages
  Direct messaging between farmers and retailers
  - `id` (uuid, primary key)
  - `sender_id` (uuid, references profiles)
  - `receiver_id` (uuid, references profiles)
  - `product_id` (uuid, references products, nullable)
  - `message` (text)
  - `is_read` (boolean)
  - `created_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Profiles: Users can read all profiles, update only their own
  - Products: Public read access, farmers can manage their own products
  - Orders: Users can only see orders they're involved in
  - Messages: Users can only see their own messages

  ## Important Notes
  1. All tables have RLS enabled for data security
  2. Foreign keys ensure data integrity
  3. Timestamps track creation and updates
  4. Location fields support map integration
  5. Order status tracking for transaction management
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type text NOT NULL CHECK (user_type IN ('farmer', 'retailer')),
  full_name text NOT NULL,
  phone text,
  location text,
  latitude numeric,
  longitude numeric,
  bio text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  category text NOT NULL,
  price numeric NOT NULL CHECK (price >= 0),
  unit text NOT NULL DEFAULT 'kg',
  quantity_available numeric NOT NULL CHECK (quantity_available >= 0),
  image_url text,
  location text,
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view available products"
  ON products FOR SELECT
  TO authenticated
  USING (is_available = true OR farmer_id = auth.uid());

CREATE POLICY "Farmers can insert own products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (
    farmer_id = auth.uid() AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'farmer')
  );

CREATE POLICY "Farmers can update own products"
  ON products FOR UPDATE
  TO authenticated
  USING (farmer_id = auth.uid())
  WITH CHECK (farmer_id = auth.uid());

CREATE POLICY "Farmers can delete own products"
  ON products FOR DELETE
  TO authenticated
  USING (farmer_id = auth.uid());

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  retailer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  farmer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  quantity numeric NOT NULL CHECK (quantity > 0),
  total_price numeric NOT NULL CHECK (total_price >= 0),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed')),
  payment_method text NOT NULL CHECK (payment_method IN ('online', 'cash_on_delivery')),
  delivery_address text NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (retailer_id = auth.uid() OR farmer_id = auth.uid());

CREATE POLICY "Retailers can create orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (
    retailer_id = auth.uid() AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'retailer')
  );

CREATE POLICY "Order parties can update orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (retailer_id = auth.uid() OR farmer_id = auth.uid())
  WITH CHECK (retailer_id = auth.uid() OR farmer_id = auth.uid());

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own messages"
  ON messages FOR SELECT
  TO authenticated
  USING (sender_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can update own received messages"
  ON messages FOR UPDATE
  TO authenticated
  USING (receiver_id = auth.uid())
  WITH CHECK (receiver_id = auth.uid());

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_products_farmer_id ON products(farmer_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_available ON products(is_available);
CREATE INDEX IF NOT EXISTS idx_orders_retailer_id ON orders(retailer_id);
CREATE INDEX IF NOT EXISTS idx_orders_farmer_id ON orders(farmer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_messages_sender_receiver ON messages(sender_id, receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);