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

export interface PrestoErrorObject extends Error {
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

export class PrestoError extends Error implements PrestoErrorObject {
  errorCode: number
  errorName: string
  errorType: string
  failureInfo: PrestoErrorObject['failureInfo']

  constructor({ errorCode, errorName, errorType, failureInfo, message }: PrestoErrorObject) {
    super(message)
    this.errorCode = errorCode
    this.errorName = errorName
    this.errorType = errorType
    this.failureInfo = failureInfo
  }
}
