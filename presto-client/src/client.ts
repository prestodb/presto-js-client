import { QUERY_INFO_URL, STATEMENT_URL } from './constants'
import {
  Column,
  PrestoClientConfig,
  PrestoError,
  PrestoQuery,
  PrestoResponse,
  QueryInfo,
  Table,
} from './types'

function digitsToBigInt(_: string, value: unknown, { source }: { source: string }) {
  return /^\d+$/.test(source) ? BigInt(source) : value
}

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

  /**
   * Creates an instance of PrestoClient.
   * @param {PrestoClientConfig} config - Configuration object for the PrestoClient.
   * @param {Object} config.basicAuthorization - Optional object for basic authorization.
   * @param {Object} config.basicAuthorization.user - The basic auth user name.
   * @param {Object} config.basicAuthorization.password - The basic auth password.
   * @param {string} config.authorizationToken - An optional token to be sent in the authorization header. Takes precedence over the basic auth.
   * @param {string} config.catalog - The default catalog to be used.
   * @param {Record<string, string>} config.extraHeaders - Any extra headers to include in the API requests. Optional.
   * @param {string} config.host - The host address of the Presto server.
   * @param {number} config.interval - The polling interval in milliseconds for query status checks.
   * @param {number} config.port - The port number on which the Presto server is listening.
   * @param {string} [config.schema] - The default schema to be used. Optional.
   * @param {string} [config.source] - The name of the source making the query. Optional.
   * @param {string} [config.timezone] - The timezone to be used for the session. Optional.
   * @param {string} config.user - The username to be used for the Presto session.
   */
  constructor({
    basicAuthentication,
    authorizationToken,
    catalog,
    extraHeaders,
    host,
    interval,
    port,
    schema,
    source,
    timezone,
    user,
  }: PrestoClientConfig) {
    this.baseUrl = `${host || 'http://localhost'}:${port || 8080}`
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

    if (authorizationToken) {
      this.headers['Authorization'] = `Bearer ${authorizationToken}`
    } else if (basicAuthentication) {
      // Note this is only available for Node.js
      this.headers['Authorization'] = `Basic ${Buffer.from(
        `${basicAuthentication.user}:${basicAuthentication.password}`,
      ).toString('base64')}`
    }

    this.headers = {
      ...extraHeaders,
      ...this.headers,
    }
  }

  /**
   * Retrieves all catalogs.
   * @returns {Promise<string[] | undefined>} An array of all the catalog names.
   */
  async getCatalogs(): Promise<string[] | undefined> {
    return (await this.query('SHOW CATALOGS')).data?.map(([catalog]) => catalog as string)
  }

  /**
   * Retrieves a list of columns filtered for the given catalog and optional filters.
   * @param {Object} options - The options for retrieving columns.
   * @param {string} options.catalog - The catalog name.
   * @param {string} [options.schema] - The schema name. Optional.
   * @param {string} [options.table] - The table name. Optional.
   * @returns {Promise<Column[] | undefined>} An array of all the columns that match the given filters.
   */
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

  /**
   * Retrieves all the information for a given query
   * @param {string} queryId The query identifier string
   * @returns {Promise<QueryInfo | undefined>} All the query information
   */
  async getQueryInfo(queryId: string): Promise<QueryInfo | undefined> {
    const queryInfoResponse = await this.request({
      headers: this.headers,
      method: 'GET',
      url: `${this.baseUrl}${QUERY_INFO_URL}${queryId}`,
    })

    if (queryInfoResponse.status !== 200) {
      throw new Error(`Query failed: ${JSON.stringify(await queryInfoResponse.text())}`)
    }

    return (await queryInfoResponse.json()) as QueryInfo
  }

  /**
   * Retrieves all schemas within a given catalog.
   * @param {string} catalog - The name of the catalog for which to retrieve schemas.
   * @returns {Promise<string[] | undefined>} An array of schema names within the specified catalog.
   */
  async getSchemas(catalog: string): Promise<string[] | undefined> {
    return (
      await this.query('SHOW SCHEMAS', {
        catalog,
      })
    ).data?.map(([schema]) => schema as string)
  }

  /**
   * Retrieves a list of tables filtered by the given catalog and optional schema.
   * @param {Object} options - The options for retrieving tables.
   * @param {string} options.catalog - The catalog name.
   * @param {string} [options.schema] - The schema name. Optional.
   * @returns {Promise<Table[] | undefined>} An array of tables that match the given filters.
   */
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

  /**
   * Executes a given query with optional catalog and schema settings.
   * @param {string} query - The SQL query string to be executed.
   * @param {Object} [options] - Optional parameters for the query.
   * @param {string} [options.catalog] - The catalog to be used for the query. Optional.
   * @param {string} [options.schema] - The schema to be used for the query. Optional.
   * @returns {Promise<PrestoQuery>} A promise that resolves to the result of the query execution.
   * @throws {PrestoError} If the underlying Presto engine returns an error
   */
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

    const firstResponse = await this.request({
      body: query,
      headers,
      method: 'POST',
      url: `${this.baseUrl}${STATEMENT_URL}`,
    })

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
      const response = await this.request({ headers, method: 'GET', url: nextUri })

      // Server is overloaded, wait a bit
      if (response.status === 503) {
        await this.delay(this.retryInterval)
        continue
      }

      if (response.status !== 200) {
        throw new Error(`Query failed: ${JSON.stringify(await response.text())}`)
      }

      const prestoResponse = (await this.prestoConversionToJSON({ response })) as PrestoResponse
      if (!prestoResponse) {
        throw new Error(`Query failed with an empty response from the server.`)
      }

      if (prestoResponse.error) {
        // Throw back the whole error object which contains all error information
        throw new PrestoError(prestoResponse.error)
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

  private delay(milliseconds: number) {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
  }

  // This builds a WHERE statement if one or more of the conditions contain non-undefined values
  // Currently only works for string values (need more conditions for number and boolean)
  private getWhereCondition(conditions: { key: string; value?: string }[]): string {
    const filteredConditions = conditions.filter(({ value }) => Boolean(value))
    if (filteredConditions.length) {
      return `WHERE ${filteredConditions.map(({ key, value }) => `${key} = '${value}'`).join(' AND ')}`
    }
    return ''
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

  private async prestoConversionToJSON({ response }: { response: Response }): Promise<unknown> {
    const text = await response.text()
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore JSON.parse with a 3 argument reviver is a stage 3 proposal with some support, allow it here.
    return JSON.parse(text, digitsToBigInt)
  }
}

export default PrestoClient
