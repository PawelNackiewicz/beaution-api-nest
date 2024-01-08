import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  async siema() {
    return 'siema';
  }
}
