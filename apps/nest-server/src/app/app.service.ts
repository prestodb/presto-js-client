import { Injectable } from '@nestjs/common'
import PrestoClient, { PrestoClientConfig, PrestoError, QueryInfo } from '@prestodb/presto-js-client'

@Injectable()
export class AppService {
  async getCatalogs(): Promise<string[] | undefined> {
    const clientParams: PrestoClientConfig = {
      catalog: 'tpch',
      host: 'http://localhost',
      port: 8080,
      schema: 'sf1',
      user: 'root',
    }
    const client = new PrestoClient(clientParams)
    try {
      return await client.getCatalogs()
    } catch (error) {
      console.error(error)
    }
  }

  async getSchemas(catalog: string): Promise<string[] | undefined> {
    const clientParams: PrestoClientConfig = {
      catalog: 'tpch',
      host: 'http://localhost',
      port: 8080,
      schema: 'sf1',
      user: 'root',
    }
    const client = new PrestoClient(clientParams)
    try {
      return await client.getSchemas(catalog)
    } catch (error) {
      console.error(error)
    }
  }

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
      return {
        columns: results.columns,
        rows: JSON.stringify(results.data, (key, value) => {
          if (typeof value != 'bigint') return value

          return value.toString()
        }),
      }
    } catch (error) {
      return (error as PrestoError).message
    }
  }

  async getQueryInfo(queryId: string): Promise<QueryInfo | undefined> {
    const clientParams: PrestoClientConfig = {
      host: 'http://localhost',
      port: 8080,
      user: 'root',
    }
    const client = new PrestoClient(clientParams)
    try {
      return await client.getQueryInfo(queryId)
    } catch (error) {
      console.error(error.message)
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
