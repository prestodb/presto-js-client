export interface PrestoClientConfig {
  catalog?: string
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

export interface PrestoError {
  errorCode: number
  errorName: string
  errorType: string
  failureInfo: {
    message: string
    stack: string[]
    suppressed: string[]
    type: string
  }
  message: string
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
