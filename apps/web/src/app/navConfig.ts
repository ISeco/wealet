import type { ComponentType } from 'react'
import {
  CategoriesIcon,
  DashboardIcon,
  FundsIcon,
  HealthIcon,
  ImportIcon,
  SettingsIcon,
  TransfersIcon,
  TransactionsIcon,
} from '../components/ui/icons'

export interface NavItem {
  key: string
  label: string
  path: string
  icon: ComponentType<{ color?: string }>
  /** Page not built yet — shown but not clickable. */
  disabled?: boolean
}

export const navMain: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', path: '/', icon: DashboardIcon },
  { key: 'funds', label: 'Fondos', path: '/fondos', icon: FundsIcon },
  { key: 'transactions', label: 'Transacciones', path: '/transacciones', icon: TransactionsIcon},
  { key: 'transfers', label: 'Transferencias', path: '/transferencias', icon: TransfersIcon },
  { key: 'health', label: 'Salud financiera', path: '/salud', icon: HealthIcon },
  { key: 'categories', label: 'Categorías', path: '/categorias', icon: CategoriesIcon },
]

export const navSys: NavItem[] = [
  { key: 'import', label: 'Importar Excel', path: '/import', icon: ImportIcon },
  { key: 'settings', label: 'Ajustes', path: '/ajustes', icon: SettingsIcon },
]

export const pageTitles: Record<string, { crumb: string; title: string }> = {
  '/': { crumb: 'General', title: 'Dashboard' },
  '/fondos': { crumb: 'General', title: 'Fondos' },
  '/transacciones': { crumb: 'General', title: 'Transacciones' },
  '/categorias': { crumb: 'General', title: 'Categorías' },
  '/transferencias': { crumb: 'General', title: 'Transferencias' },
  '/salud': { crumb: 'General', title: 'Salud financiera' },
  '/ajustes': { crumb: 'Sistema', title: 'Ajustes' },
  '/import': { crumb: 'Sistema', title: 'Importar Excel' },
}
