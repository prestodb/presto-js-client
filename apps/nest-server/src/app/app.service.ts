import { Injectable } from '@nestjs/common'
import PrestoClient, { PrestoClientConfig, PrestoError } from '@prestodb/presto-js-client'

@Injectable()
export class AppService {
  async getData(): Promise<unknown> {
    const clientParams: PrestoClientConfig = {
      catalog: 'tpch',
      host: 'http://localhost',
      port: 8080,
      schema: 'sf1',
      user: 'root',
    }
    const client = new PrestoClient(clientParams)
    try {
      const results = await client.query(
        `select returnflag, linestatus, sum(quantity) as sum_qty, sum(extendedprice) as sum_base_price, sum(extendedprice * (1 - discount)) as sum_disc_price, sum(extendedprice * (1 - discount) * (1 + tax)) as sum_charge, avg(quantity) as avg_qty, avg(extendedprice) as avg_price, avg(discount) as avg_disc, count(*) as count_order from lineitem where shipdate <= date '1998-12-01' group by returnflag, linestatus order by returnflag, linestatus`,
      )
      return { columns: results.columns, rows: results.data }
    } catch (error) {
      return (error as PrestoError).message
    }
  }

  async getDataWithError(): Promise<unknown> {
    const clientParams: PrestoClientConfig = {
      catalog: 'tpch',
      host: 'http://localhost',
      port: 8080,
      schema: 'sf1',
      user: 'root',
    }
    const client = new PrestoClient(clientParams)
    try {
      const results = await client.query(`SELECT * FROM A SYNTAX ERROR`)
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
