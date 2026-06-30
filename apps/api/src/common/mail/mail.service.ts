import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly passwordResetTemplate = readFileSync(
    join(__dirname, 'email-templates', 'password-reset.html'),
    'utf-8',
  );

  constructor(private readonly configService: ConfigService) {}

  async sendPasswordReset(to: string, resetUrl: string): Promise<void> {
    const apiKey = this.configService.get<string>('BREVO_API_KEY')!;
    const from = this.configService.get<string>('BREVO_FROM_EMAIL')!;

    const html = this.passwordResetTemplate.replaceAll(
      '{{resetUrl}}',
      resetUrl,
    );

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        sender: { name: 'Wealet', email: from },
        to: [{ email: to }],
        subject: 'Recupera tu contraseña — Wealet',
        htmlContent: html,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      this.logger.error(`Brevo email failed: ${response.status} ${body}`);
      throw new Error('No se pudo enviar el correo de recuperación');
    }
  }
}
