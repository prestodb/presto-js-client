import { NextResponse } from 'next/server'

import PrestoClient from '@prestodb/presto-js-client'

export async function GET() {
  const prestoClientConfig = {
    catalog: 'tpcds',
    host: 'http://localhost',
    port: 8080,
    schema: 'sf1',
    user: 'root',
  }
  const client = new PrestoClient(prestoClientConfig)
  const results = await client.query(`SELECT * FROM call_center`)
  const columnNames = results?.columns?.map(({ name }) => name)
  const data = results?.data?.map((tuple: unknown[]) => {
    const row = columnNames?.reduce((acc: Record<string, unknown>, columnName, columnIndex) => {
      if (columnName) {
        acc[columnName] = tuple[columnIndex]
      }

      return acc
    }, {})

    return row
  })

  return NextResponse.json({ data })
}
