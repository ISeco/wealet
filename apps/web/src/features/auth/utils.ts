import type { User } from './types'

export function getUserInitials(user: Pick<User, 'displayName' | 'email'> | null | undefined): string {
  return (user?.displayName ?? user?.email ?? '?')
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}
