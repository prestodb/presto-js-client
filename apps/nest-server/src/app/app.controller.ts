import { Controller, Get } from '@nestjs/common'

import { AppService } from './app.service'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('query-test')
  async getData() {
    try {
      return await this.appService.getData()
    } catch (err) {
      console.error(err)
    }
  }
}
