import type { ApiEnvelope } from '../types/api'

const configuredApiBase = import.meta.env.VITE_API_BASE_URL?.trim()
if (!configuredApiBase) throw new Error('缺少 VITE_API_BASE_URL，请检查 frontend 环境变量')
const API_BASE = configuredApiBase.replace(/\/$/, '')
export const assetOrigin = API_BASE.replace(/\/api$/, '')

export class ApiError extends Error {
  constructor(message: string, public readonly status?: number) { super(message) }
}

export async function request<T>(path: string, options?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: { Accept: 'application/json', ...options?.headers },
    })
  } catch {
    throw new ApiError('暂时无法连接内容服务，请确认后端已启动。')
  }

  let payload: ApiEnvelope<T> | null = null
  try { payload = await response.json() as ApiEnvelope<T> } catch { /* handled below */ }
  if (!response.ok || !payload || payload.code !== 0) {
    throw new ApiError(payload?.message || '内容加载失败，请稍后重试。', response.status)
  }
  return payload.data
}

export function resolveAssetUrl(path?: string | null): string {
  if (!path) return ''
  if (/^https?:\/\//i.test(path) || path.startsWith('data:')) return path
  return `${assetOrigin}${path.startsWith('/') ? '' : '/'}${path}`
}
