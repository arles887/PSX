-- PSX Supabase schema: core tables for tools platform
-- Run these in your Supabase SQL editor to create tables

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  icon text,
  parent_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Tools
CREATE TABLE IF NOT EXISTS tools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  short_description text,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  icon text,
  is_premium boolean DEFAULT false,
  is_active boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  usage_count bigint DEFAULT 0,
  likes_count bigint DEFAULT 0,
  api_endpoint text,
  input_schema jsonb,
  output_schema jsonb,
  keywords text[] DEFAULT ARRAY[]::text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS tools_keywords_idx ON tools USING gin (keywords);
CREATE INDEX IF NOT EXISTS tools_search_idx ON tools USING gin ((to_tsvector('simple', coalesce(name, '') || ' ' || coalesce(short_description, '') || ' ' || coalesce(description, ''))));

-- Tool usages / history
CREATE TABLE IF NOT EXISTS tool_usages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  tool_id uuid REFERENCES tools(id) ON DELETE SET NULL,
  input_data jsonb,
  output_data jsonb,
  processing_time_ms integer,
  status text DEFAULT 'pending',
  error_message text,
  created_at timestamptz DEFAULT now()
);

-- Bookmarks
CREATE TABLE IF NOT EXISTS bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_id uuid REFERENCES tools(id) ON DELETE CASCADE,
  resource_id uuid,
  resource_type text,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, tool_id)
);

-- Posts / Blog
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  content text,
  excerpt text,
  cover_image text,
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  status text DEFAULT 'draft',
  is_featured boolean DEFAULT false,
  views_count bigint DEFAULT 0,
  likes_count bigint DEFAULT 0,
  keywords text[] DEFAULT ARRAY[]::text[],
  meta_title text,
  meta_description text,
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Media assets
CREATE TABLE IF NOT EXISTS media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  url text NOT NULL,
  thumbnail_url text,
  mime_type text,
  size_bytes bigint,
  usage_count bigint DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- User-created resources
CREATE TABLE IF NOT EXISTS resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  content text,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  file_url text,
  file_size bigint,
  file_type text,
  thumbnail_url text,
  is_premium boolean DEFAULT false,
  is_active boolean DEFAULT true,
  download_count bigint DEFAULT 0,
  keywords text[] DEFAULT ARRAY[]::text[],
  created_at timestamptz DEFAULT now()
);

-- Analytics events (minimal)
CREATE TABLE IF NOT EXISTS analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- Trending keywords
CREATE TABLE IF NOT EXISTS trending_keywords (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword text NOT NULL UNIQUE,
  search_count bigint DEFAULT 0,
  category text,
  last_searched_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Billing records
CREATE TABLE IF NOT EXISTS billing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  stripe_customer_id text,
  stripe_subscription_id text,
  tier text,
  status text,
  current_period_end timestamptz,
  created_at timestamptz DEFAULT now()
);
