import { User } from '../entities/user.entity';
import { UserProfileDto } from '../dto/user-profile.dto';

export function toUserProfileDto(user: User): UserProfileDto {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    theme: user.theme,
    onboardingCompleted: user.onboardingCompleted,
    onboardingCompletedAt: user.onboardingCompletedAt,
  };
}
