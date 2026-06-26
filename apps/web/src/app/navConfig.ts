import type { ComponentType } from 'react'
import {
  CategoriesIcon,
  DashboardIcon,
  FundsIcon,
  HealthIcon,
  ImportIcon,
  SettingsIcon,
  TransactionsIcon,
  TransfersIcon,
} from './icons'

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
  { key: 'transactions', label: 'Transacciones', path: '/transacciones', icon: TransactionsIcon },
  { key: 'transfers', label: 'Transferencias', path: '/transferencias', icon: TransfersIcon, disabled: true },
  { key: 'health', label: 'Salud financiera', path: '/salud', icon: HealthIcon, disabled: true },
  { key: 'categories', label: 'Categorías', path: '/categorias', icon: CategoriesIcon, disabled: true },
]

export const navSys: NavItem[] = [
  { key: 'import', label: 'Importar Excel', path: '/import', icon: ImportIcon, disabled: true },
  { key: 'settings', label: 'Ajustes', path: '/ajustes', icon: SettingsIcon, disabled: true },
]

export const pageTitles: Record<string, { crumb: string; title: string }> = {
  '/': { crumb: 'General', title: 'Dashboard' },
  '/fondos': { crumb: 'General', title: 'Fondos' },
  '/transacciones': { crumb: 'General', title: 'Transacciones' },
}
