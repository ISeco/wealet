import { toUserProfileDto } from './user-profile.mapper';
import { User } from '../entities/user.entity';

describe('toUserProfileDto', () => {
  it('incluye baseCurrency del usuario', () => {
    const user = {
      id: 'u1',
      email: 'a@b.cl',
      displayName: null,
      theme: 'system',
      onboardingCompleted: false,
      onboardingCompletedAt: null,
      passwordHash: 'x',
      baseCurrency: 'CLP',
    } as User;

    expect(toUserProfileDto(user).baseCurrency).toBe('CLP');
  });
});
