import { request } from './http'
import type { Category, ContentItem, PageContent, Paginated, ResourceType, Tag } from '../types/api'

export interface ContentQuery {
  page: number; pageSize: number; keyword?: string; categoryId?: number; tags?: string[]
  colors?: string[]; crafts?: string[]; parts?: string[]; meanings?: string[]
  sort?: 'default' | 'latest' | 'popular' | 'downloads'
}

function paramsOf(type: ResourceType, query: ContentQuery) {
  const params = new URLSearchParams({ type, page: String(query.page), pageSize: String(query.pageSize), sort: query.sort || 'default' })
  if (query.keyword) params.set('keyword', query.keyword)
  if (query.categoryId) params.set('categoryId', String(query.categoryId))
  ;(['tags', 'colors', 'crafts', 'parts', 'meanings'] as const).forEach(key => query[key]?.forEach(value => params.append(key, value)))
  return params
}

export const getContents = (type: ResourceType, query: ContentQuery) => request<Paginated<ContentItem>>(`/contents?${paramsOf(type, query)}`)
export const getContent = (type: ResourceType, id: string) => request<ContentItem>(`/contents/${type}/${id}`)
export const getCategories = (type: ResourceType) => request<Paginated<Category>>(`/categories?resourceType=${type}&pageSize=100`)
export const getTags = () => request<Paginated<Tag>>('/tags?pageSize=100')
export const getPage = (key: string) => request<PageContent>(`/pages/${key}`)
