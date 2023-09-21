import { PrestoClientConfig, PrestoQuery, PrestoResponse } from './client.types'

export class PrestoClient {
  private baseUrl: string
  private catalog: string
  private headers: Record<string, string>
  private interval: number
  private schema: string
  private timezone?: string
  private user: string

  constructor({ catalog, host, interval, port, schema, timezone, user }: PrestoClientConfig) {
    this.baseUrl = `${host || 'http://localhost'}:${port || 8080}/v1/statement`
    this.catalog = catalog
    this.interval = interval || 100
    this.schema = schema
    this.timezone = timezone
    this.user = user

    this.headers = { 'X-Presto-Client-Info': 'presto-js-client' }
    if (this.user) {
      this.headers['X-Presto-User'] = this.user
    }
    if (this.schema) {
      this.headers['X-Presto-Schema'] = this.schema
    }
    if (this.catalog) {
      this.headers['X-Presto-Catalog'] = this.catalog
    }
    if (this.timezone) {
      this.headers['X-Presto-Time-Zone'] = this.timezone
    }

    // TODO: Set up auth
  }

  private request(url: string, method: string, body: string | null = null) {
    return fetch(url, {
      body,
      headers: this.headers,
      method,
    })
  }

  async query(query: string): Promise<PrestoQuery> {
    // TODO: Checks for valid schema and catalog
    const firstResponse = await this.request(this.baseUrl, 'POST', query)

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
      const response = await this.request(nextUri, 'GET')

      if (response.status !== 200) {
        throw new Error(`Query failed: ${JSON.stringify(await response.text())}`)
      }

      const prestoResponse = (await response.json()) as PrestoResponse

      nextUri = prestoResponse?.nextUri
      queryId = prestoResponse.id

      const columnsAreEmpty = !columns.length
      if (columnsAreEmpty && prestoResponse.columns?.length) {
        columns.push(...prestoResponse.columns)
      }
      if (prestoResponse.data?.length) {
        data.push(...prestoResponse.data)
      }

      await delay(this.interval)
    } while (nextUri !== undefined)

    return {
      columns,
      data,
      queryId,
    }
  }
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
