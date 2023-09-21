import { Injectable } from '@nestjs/common'
import { PrestoClient } from '@presto/client'

@Injectable()
export class AppService {
  async getData(): Promise<unknown> {
    const client = new PrestoClient({
      catalog: 'tpcds',
      host: 'http://localhost',
      port: 8080,
      schema: 'sf10',
      user: 'root',
    })
    const results = await client.query(`SELECT * FROM call_center`)
    return { columns: results.columns, rows: results.data }
  }
}
