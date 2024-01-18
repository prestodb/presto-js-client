import { PrestoClientConfig, PrestoError, PrestoQuery, PrestoResponse } from './client.types'

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

  /**
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
}

export default PrestoClient
