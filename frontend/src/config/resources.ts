import type { ResourceType } from '../types/api'

export interface ResourceConfig { type: ResourceType; path: string; title: string; intro: string; portrait?: boolean }
export const resources: ResourceConfig[] = [
  { type: 'pattern', path: 'patterns', title: '纹样素材', intro: '从构图、色彩、工艺与文化寓意等维度检索盘绣纹样。' },
  { type: 'document', path: 'documents', title: '文献资料', intro: '查阅盘绣研究、历史记录与相关文献。' },
  { type: 'creation', path: 'creations', title: '共创作品', intro: '呈现传统纹样与当代创作的共生实践。' },
  { type: 'inheritor', path: 'inheritors', title: '传承人介绍', intro: '记录盘绣技艺传承者的经历与实践。', portrait: true },
  { type: 'application_case', path: 'applications', title: '应用案例', intro: '查看盘绣纹样在当代设计中的应用。' },
]
export const byType = Object.fromEntries(resources.map(item => [item.type, item])) as Record<ResourceType, ResourceConfig>
