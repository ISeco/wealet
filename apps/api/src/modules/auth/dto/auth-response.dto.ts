export class UserResponseDto {
  id: string;
  email: string;
  displayName: string | null;
}

export class AuthResponseDto {
  accessToken: string;
  user: UserResponseDto;
}
