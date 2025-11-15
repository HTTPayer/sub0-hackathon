import { LucideIcon } from 'lucide-react'

export interface Category {
  name: string
  icon: LucideIcon
  count: number
}

export interface Product {
  id: number
  name: string
  provider: string
  category: string
  description: string
  pricing: {
    write?: number
    read?: number
    base?: number
    perRun?: number
    perCall?: number
  }
  estimate: string
  uptime: string
  users: string
  features: string[]
  integration: string
}

export interface Session {
  id: string
  created: string
  spent: number
  capabilities: string[]
}

export type TabType = 'marketplace' | 'sessions'
