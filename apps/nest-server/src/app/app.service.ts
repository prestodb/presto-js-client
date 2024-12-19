import { Injectable } from '@nestjs/common'
import { PrestoError, QueryInfo } from '@prestodb/presto-js-client'
import { PrestoService } from './presto.service'

@Injectable()
export class AppService {
  constructor(private prestoService: PrestoService) {}
  async getCatalogs(): Promise<string[] | undefined> {
    try {
      return await this.prestoService.getCatalogs()
    } catch (error) {
      console.error(error)
    }
  }

  async getSchemas(catalog: string): Promise<string[] | undefined> {
    try {
      return await this.prestoService.getSchemas(catalog)
    } catch (error) {
      console.error(error)
    }
  }

  async getData(): Promise<unknown> {
    try {
      const results = await this.prestoService.query(
        `select returnflag, linestatus, sum(quantity) as sum_qty, sum(extendedprice) as sum_base_price, sum(extendedprice * (1 - discount)) as sum_disc_price, sum(extendedprice * (1 - discount) * (1 + tax)) as sum_charge, avg(quantity) as avg_qty, avg(extendedprice) as avg_price, avg(discount) as avg_disc, count(*) as count_order from lineitem where shipdate <= date '1998-12-01' group by returnflag, linestatus order by returnflag, linestatus`,
      )
      return { columns: results.columns, rows: results.data }
    } catch (error) {
      return (error as PrestoError).message
    }
  }

  async getQueryInfo(queryId: string): Promise<QueryInfo | undefined> {
    try {
      return await this.prestoService.getQueryInfo(queryId)
    } catch (error) {
      console.error(error.message)
    }
  }

  async getDataWithError(): Promise<unknown> {
    try {
      const results = await this.prestoService.query(`SELECT * FROM A SYNTAX ERROR`)
      return { columns: results.columns, rows: results.data }
    } catch (error) {
      if (error instanceof PrestoError) {
        /* eslint-disable no-console */
        // The error here contains all the information returned by Presto directly
        console.info(error.message)
        console.info(error.name)
        console.info(error.errorCode)
        console.info(error.stack)
        console.info(error.failureInfo.type)
        return 'A Presto error ocurred, please check the service logs'
      }
      console.error(error)
      return error
    }
  }
}
