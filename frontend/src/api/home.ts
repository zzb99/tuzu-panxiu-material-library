import { request } from './http'
import type { Banner, FeaturedGroups, PageContent, Paginated, SiteSettings } from '../types/api'

export const getBanners = () => request<Paginated<Banner>>('/banners?page=1&pageSize=20')
export const getFeatured = () => request<FeaturedGroups>('/featured?limit=8')
export const getPageContent = (key: string) => request<PageContent>(`/pages/${encodeURIComponent(key)}`)
export const getSiteSettings = () => request<SiteSettings>('/site-settings')
