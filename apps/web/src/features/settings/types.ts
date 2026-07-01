export interface UpdateProfilePayload {
  displayName?: string
  theme?: 'light' | 'dark'
}

export interface ChangePasswordPayload {
  currentPassword?: string
  newPassword: string
}
