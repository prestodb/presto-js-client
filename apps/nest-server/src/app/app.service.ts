import { Injectable } from '@nestjs/common'
import PrestoClient, { PrestoClientConfig } from '@prestodb/presto-js-client'

@Injectable()
export class AppService {
  async getData(): Promise<unknown> {
    const clientParams: PrestoClientConfig = {
      catalog: 'tpcds',
      host: 'http://localhost',
      port: 8080,
      schema: 'sf10',
      user: 'root',
    }
    const client = new PrestoClient(clientParams)
    const results = await client.query(`SELECT * FROM call_center`)
    return { columns: results.columns, rows: results.data }
  }
}
