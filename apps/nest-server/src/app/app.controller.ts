import { Controller, Get, Param } from '@nestjs/common'

import { AppService } from './app.service'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('get-schemas')
  async getSchemas(@Param('catalog') catalog: string) {
    try {
      return await this.appService.getSchemas(catalog)
    } catch (err) {
      console.error(err)
    }
  }

  @Get('get-catalogs')
  async getCatalogs() {
    try {
      return await this.appService.getCatalogs()
    } catch (err) {
      console.error(err)
    }
  }

  @Get('query-test')
  async getData() {
    try {
      return await this.appService.getData()
    } catch (err) {
      console.error(err)
    }
  }

  @Get('presto-error')
  async getDataWithError() {
    try {
      return await this.appService.getDataWithError()
    } catch (err) {
      console.error(err)
    }
  }
}
