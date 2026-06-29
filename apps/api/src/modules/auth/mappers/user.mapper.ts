import { User } from '../../users/entities/user.entity';
import { UserResponseDto } from '../dto/auth-response.dto';

export function toUserResponseDto(user: User): UserResponseDto {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    onboardingCompleted: user.onboardingCompleted,
  };
}
