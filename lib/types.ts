// Database types
export interface Profile {
  id: string
  email: string | null
  full_name: string | null
  avatar_url: string | null
  role: 'user' | 'admin' | 'premium'
  subscription_tier: 'free' | 'pro' | 'enterprise'
  subscription_expires_at: string | null
  api_calls_used: number
  api_calls_limit: number
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  parent_id: string | null
  is_active: boolean
  sort_order: number
  created_at: string
}

export interface Tool {
  id: string
  name: string
  slug: string
  description: string | null
  short_description: string | null
  category_id: string | null
  icon: string | null
  is_premium: boolean
  is_active: boolean
  is_featured: boolean
  usage_count: number
  likes_count: number
  api_endpoint: string | null
  input_schema: Record<string, unknown> | null
  output_schema: Record<string, unknown> | null
  keywords: string[] | null
  created_at: string
  updated_at: string
  category?: Category
}

export interface ToolUsage {
  id: string
  user_id: string | null
  tool_id: string | null
  input_data: Record<string, unknown> | null
  output_data: Record<string, unknown> | null
  processing_time_ms: number | null
  status: 'pending' | 'processing' | 'completed' | 'failed'
  error_message: string | null
  created_at: string
}

export interface Bookmark {
  id: string
  user_id: string
  tool_id: string | null
  resource_id: string | null
  resource_type: 'tool' | 'post' | 'resource' | 'download' | null
  created_at: string
  tool?: Tool
}

export interface Like {
  id: string
  user_id: string
  tool_id: string | null
  resource_id: string | null
  resource_type: 'tool' | 'post' | 'comment' | null
  created_at: string
}

export interface Post {
  id: string
  title: string
  slug: string
  content: string | null
  excerpt: string | null
  cover_image: string | null
  author_id: string | null
  category_id: string | null
  status: 'draft' | 'published' | 'archived'
  is_featured: boolean
  views_count: number
  likes_count: number
  keywords: string[] | null
  meta_title: string | null
  meta_description: string | null
  published_at: string | null
  created_at: string
  updated_at: string
  author?: Profile
  category?: Category
}

export interface Comment {
  id: string
  user_id: string
  post_id: string | null
  tool_id: string | null
  parent_id: string | null
  content: string
  is_approved: boolean
  likes_count: number
  created_at: string
  updated_at: string
  user?: Profile
  replies?: Comment[]
}

export interface Resource {
  id: string
  owner_id: string | null
  title: string
  slug: string
  description: string | null
  content: string | null
  category_id: string | null
  file_url: string | null
  file_size: number | null
  file_type: string | null
  thumbnail_url: string | null
  is_premium: boolean
  is_active: boolean
  download_count: number
  keywords: string[] | null
  created_at: string
  category?: Category
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string | null
  type: 'info' | 'success' | 'warning' | 'error'
  is_read: boolean
  action_url: string | null
  created_at: string
}

export interface SearchHistory {
  id: string
  user_id: string | null
  query: string
  results_count: number
  created_at: string
}

export interface TrendingKeyword {
  id: string
  keyword: string
  search_count: number
  category: string | null
  last_searched_at: string
  created_at: string
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Search types
export interface SearchResult {
  tools: Tool[]
  posts: Post[]
  resources: Resource[]
  total: number
}

// Tool execution types
export interface ToolInput {
  [key: string]: string | number | boolean | string[]
}

export interface ToolOutput {
  result: unknown
  processingTime: number
  metadata?: Record<string, unknown>
}
