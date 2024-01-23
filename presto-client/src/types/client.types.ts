import { PrestoError } from './error.types'

export interface PrestoClientConfig {
  authorizationToken?: string
  basicAuthentication?: {
    user: string
    password: string
  }
  catalog?: string
  extraHeaders?: Record<string, string>
  host?: string
  interval?: number
  port?: number
  schema?: string
  source?: string
  timezone?: string
  user: string
}

export interface PrestoColumn {
  name: string
  type: string
  typeSignature?: {
    arguments: Array<{
      kind: string
      value: number
    }>
    literalArguments: string[]
    rawType: string
    typeArguments: string[]
  }
}

export interface PrestoResponse {
  columns: Array<PrestoColumn>
  data: unknown[][]
  error: PrestoError
  id: string
  stats: PrestoStats
  nextUri: string
  updateType: string
}

export interface PrestoStats {
  state: string
}

export interface PrestoQuery {
  columns?: Array<PrestoColumn>
  data?: unknown[][]
  queryId?: string
}

export type GetPrestoDataParams = PrestoClientConfig & {
  query: string
}
