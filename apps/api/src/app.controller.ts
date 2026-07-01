import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('health')
  @HttpCode(HttpStatus.OK)
  getHealth() {
    return { status: 'ok' };
  }
}
