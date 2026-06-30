import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) {}

  findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  create(
    email: string,
    passwordHash: string,
    displayName?: string,
  ): Promise<User> {
    const user = this.usersRepository.create({
      email,
      passwordHash,
      displayName: displayName ?? null,
    });
    return this.usersRepository.save(user);
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.displayName !== undefined) {
      user.displayName = dto.displayName;
    }
    if (dto.theme !== undefined) {
      user.theme = dto.theme;
    }
    if (dto.onboardingCompleted !== undefined) {
      user.onboardingCompleted = dto.onboardingCompleted;
      user.onboardingCompletedAt = dto.onboardingCompleted ? new Date() : null;
    }

    return this.usersRepository.save(user);
  }

  async updatePasswordHash(id: string, passwordHash: string): Promise<void> {
    await this.usersRepository.update({ id }, { passwordHash });
  }

  async findByPasswordResetToken(tokenHash: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { passwordResetToken: tokenHash },
    });
  }

  async savePasswordResetToken(
    userId: string,
    tokenHash: string,
    expiresAt: Date,
  ): Promise<void> {
    await this.usersRepository.update(
      { id: userId },
      { passwordResetToken: tokenHash, passwordResetExpiresAt: expiresAt },
    );
  }

  async clearPasswordResetToken(userId: string): Promise<void> {
    await this.usersRepository.update(
      { id: userId },
      { passwordResetToken: null, passwordResetExpiresAt: null },
    );
  }
}
