export class UserResponseDto {
  id: string;
  email: string;
  displayName: string | null;
  onboardingCompleted: boolean;
}

export class AuthResponseDto {
  accessToken: string;
  user: UserResponseDto;
}
