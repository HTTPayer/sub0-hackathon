"use client"

import React, { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import type { TabType } from '@/types'

type TabContextValue = {
  activeTab: TabType
  setActiveTab: (tab: TabType) => void
}

const TabContext = createContext<TabContextValue | undefined>(undefined)

export function TabProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState<TabType>('marketplace')

  return (
    <TabContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </TabContext.Provider>
  )
}

export function useTab() {
  const ctx = useContext(TabContext)
  if (!ctx) throw new Error('useTab must be used within a TabProvider')
  return ctx
}
