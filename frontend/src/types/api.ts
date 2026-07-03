export type ResourceType = 'pattern' | 'document' | 'creation' | 'inheritor' | 'application_case'

export interface ApiEnvelope<T> { code: number; message: string; data: T }
export interface Paginated<T> { items: T[]; page: number; pageSize: number; total: number; totalPages: number }

export interface ContentItem {
  id: number
  title: string
  cover_image?: string | null
  image_url?: string | null
  description?: string | null
  content?: string | null
  tags?: string[] | string | null
  category_id?: number | null
  images?: PatternImage[]
  downloadFiles?: DownloadFile[]
  is_featured?: number | boolean
  view_count?: number
  download_count?: number
  [key: string]: unknown
}

export interface PatternImage { id: number; image_url: string; alt_text?: string | null }
export interface DownloadFile { id: number; file_name: string; file_type?: string; file_size?: number; download_count?: number }
export interface Category { id: number; resource_type: ResourceType; name: string }
export interface Tag { id: number; name: string }

export interface Banner {
  id: number
  title: string
  subtitle?: string | null
  image_url?: string | null
  link_url?: string | null
  link_text?: string | null
}

export interface PageContent {
  id: number
  page_key: string
  title: string
  cover_image?: string | null
  description?: string | null
  content?: string | null
}

export type FeaturedGroups = Record<ResourceType, ContentItem[]>
export interface SiteSettings { site_name?: string | null; site_subtitle?: string | null; contact?: string | null; copyright?: string | null; icp?: string | null }
