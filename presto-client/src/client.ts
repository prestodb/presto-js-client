import { PrestoClientConfig, PrestoQuery, PrestoResponse } from './client.types'
import { Column, Table } from './information-schema.types'

export class PrestoClient {
  private baseUrl: string
  private catalog?: string
  private headers: Record<string, string>
  private interval?: number
  private retryInterval: number
  private schema?: string
  private source?: string
  private timezone?: string
  private user: string

  constructor({ catalog, host, interval, port, schema, source, timezone, user }: PrestoClientConfig) {
    this.baseUrl = `${host || 'http://localhost'}:${port || 8080}/v1/statement`
    this.catalog = catalog
    this.interval = interval
    this.schema = schema
    this.source = source
    this.timezone = timezone
    this.user = user

    this.retryInterval = 500

    this.headers = {
      'X-Presto-Client-Info': 'presto-js-client',
      'X-Presto-Source': this.source || 'presto-js-client',
    }
    if (this.user) {
      this.headers['X-Presto-User'] = this.user
    }
    if (this.timezone) {
      this.headers['X-Presto-Time-Zone'] = this.timezone
    }

    // TODO: Set up auth
  }

  private request({
    body,
    headers,
    method,
    url,
  }: {
    body?: string
    headers?: Record<string, string>
    method: string
    url: string
  }) {
    return fetch(url, {
      body,
      headers,
      method,
    })
  }

  async query(
    query: string,
    options?: {
      catalog?: string
      schema?: string
    },
  ): Promise<PrestoQuery> {
    const catalog = options?.catalog || this.catalog
    const schema = options?.schema || this.schema

    const headers = {
      ...this.headers,
    }

    if (catalog) {
      headers['X-Presto-Catalog'] = catalog
    }
    if (schema) {
      headers['X-Presto-Schema'] = schema
    }

    const firstResponse = await this.request({ body: query, headers, method: 'POST', url: this.baseUrl })

    if (firstResponse.status !== 200) {
      throw new Error(`Query failed: ${JSON.stringify(await firstResponse.text())}`)
    }

    let nextUri = ((await firstResponse?.json()) as PrestoResponse)?.nextUri

    if (!nextUri) {
      throw new Error(`Didn't receive the first nextUri`)
    }

    let queryId: string | undefined = undefined
    const columns = []
    const data = []

    do {
      const response = await this.request({ method: 'GET', url: nextUri })

      // Server is overloaded, wait a bit
      if (response.status === 503) {
        await this.delay(this.retryInterval)
        continue
      }

      if (response.status !== 200) {
        throw new Error(`Query failed: ${JSON.stringify(await response.text())}`)
      }

      const prestoResponse = (await response.json()) as PrestoResponse
      if (!prestoResponse) {
        throw new Error(`Query failed with an empty response from the server.`)
      }

      if (prestoResponse.error) {
        throw new Error(prestoResponse.error.errorName)
      }

      nextUri = prestoResponse?.nextUri
      queryId = prestoResponse?.id

      const columnsAreEmpty = !columns.length
      if (columnsAreEmpty && prestoResponse.columns?.length) {
        columns.push(...prestoResponse.columns)
      }
      if (prestoResponse.data?.length) {
        data.push(...prestoResponse.data)
      }

      if (this.interval) {
        await this.delay(this.interval)
      }
    } while (nextUri !== undefined)

    return {
      columns,
      data,
      queryId,
    }
  }

  async getCatalogs(): Promise<string[] | undefined> {
    return (await this.query(`SHOW CATALOGS`)).data?.map(([catalog]) => catalog as string)
  }

  async getSchemas(catalog: string): Promise<string[] | undefined> {
    return (
      await this.query(`SHOW SCHEMAS`, {
        catalog,
      })
    ).data?.map(([schema]) => schema as string)
  }

  async getTables({ catalog, schema }: { catalog: string; schema?: string }): Promise<Table[] | undefined> {
    const whereCondition = this.getWhereCondition([{ key: 'table_schema', value: schema }])
    // The order of the select expression columns is important since we destructure them in the same order below
    const query = `SELECT table_catalog, table_schema, table_name, table_type FROM information_schema.tables ${whereCondition}`
    const rawResult = (
      await this.query(query, {
        catalog,
      })
    ).data
    // This destructuring names the fields properly for each row, and converts them to camelCase
    return rawResult?.map(([tableCatalog, tableSchema, tableName, tableType]) => ({
      tableCatalog,
      tableSchema,
      tableName,
      tableType,
    })) as Table[]
  }

  async getColumns({
    catalog,
    schema,
    table,
  }: {
    catalog: string
    schema?: string
    table?: string
  }): Promise<Column[] | undefined> {
    const whereCondition = this.getWhereCondition([
      { key: 'table_schema', value: schema },
      { key: 'table_name', value: table },
    ])

    // The order of the select expression columns is important since we destructure them in the same order below
    const query = `SELECT table_catalog, table_schema, table_name, column_name, column_default, is_nullable, data_type, comment, extra_info FROM information_schema.columns ${whereCondition}`
    const rawResult = (
      await this.query(query, {
        catalog,
      })
    ).data
    return rawResult?.map(
      ([
        // This destructuring names the fields properly for each row, and converts them to camelCase
        tableCatalog,
        tableSchema,
        tableName,
        columnName,
        columnDefault,
        isNullable,
        dataType,
        comment,
        extraInfo,
      ]) => ({
        tableCatalog,
        tableSchema,
        tableName,
        columnName,
        columnDefault,
        isNullable,
        dataType,
        comment,
        extraInfo,
      }),
    ) as Column[]
  }

  private delay(milliseconds: number) {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
  }

  private getWhereCondition(conditions: { key: string; value?: string }[]): string {
    const filteredConditions = conditions.filter(({ value }) => Boolean(value))
    if (filteredConditions.length) {
      return `WHERE ${filteredConditions.map(({ key, value }) => `${key} = '${value}'`).join(' AND ')}`
    }
    return ''
  }
}

export default PrestoClient
