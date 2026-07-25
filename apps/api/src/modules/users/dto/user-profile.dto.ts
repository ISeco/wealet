import { UserTheme } from '../entities/user.entity';

export class UserProfileDto {
  id: string;
  email: string;
  displayName: string | null;
  theme: UserTheme;
  baseCurrency: string;
  onboardingCompleted: boolean;
  onboardingCompletedAt: Date | null;
  hasPassword: boolean;
}
