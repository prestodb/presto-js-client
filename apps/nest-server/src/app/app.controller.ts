import { Controller, Get, Query } from '@nestjs/common'

import { PrestoService } from './presto.service'

@Controller()
export class AppController {
  constructor(private readonly prestoService: PrestoService) {}

  @Get('catalogs')
  async getCatalogs() {
    try {
      return await this.prestoService.getCatalogs()
    } catch (err) {
      console.error(err)
      return err
    }
  }

  @Get('schemas')
  async getSchemas(@Query('catalog') catalog: string) {
    try {
      return await this.prestoService.getSchemas(catalog)
    } catch (err) {
      console.error(err)
      return err
    }
  }

  @Get('tables')
  async getTables(@Query('catalog') catalog: string, @Query('schema') schema?: string) {
    try {
      return await this.prestoService.getTables({ catalog, schema })
    } catch (err) {
      console.error(err)
      return err
    }
  }

  @Get('columns')
  async getColumns(
    @Query('catalog') catalog: string,
    @Query('schema') schema?: string,
    @Query('table') table?: string,
  ) {
    try {
      return await this.prestoService.getColumns({ catalog, schema, table })
    } catch (err) {
      console.error(err)
      return err
    }
  }

  @Get('query')
  async query(
    @Query('query') query: string,
    @Query('catalog') catalog?: string,
    @Query('schema') schema?: string,
  ) {
    try {
      return await this.prestoService.query(query, { catalog, schema })
    } catch (err) {
      console.error(err)
      return err
    }
  }

  @Get('query-info')
  async getQueryInfo(@Query('queryId') queryId: string) {
    try {
      return await this.prestoService.getQueryInfo(queryId)
    } catch (err) {
      console.error(err)
      return err
    }
  }
}
