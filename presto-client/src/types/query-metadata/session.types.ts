export interface ResourceEstimates {
  executionTime?: string
  cpuTime?: string
  peakMemory?: string
  peakTaskMemory?: string
}

export interface SessionRepresentation {
  queryId: string
  transactionId?: string
  clientTransactionSupport: boolean
  user: string
  principal?: string
  source?: string
  catalog?: string
  schema?: string
  traceToken?: string
  timeZoneKey: number
  locale: string
  remoteUserAddress?: string
  userAgent?: string
  clientInfo?: string
  clientTags: Set<string>
  startTime: number
  resourceEstimates: ResourceEstimates
  systemProperties: { [key: string]: string }
  catalogProperties: { [key: string]: { [key: string]: string } }
  unprocessedCatalogProperties: { [key: string]: { [key: string]: string } }
  roles: { [key: string]: unknown }
  preparedStatements: { [key: string]: string }
  sessionFunctions: { [key: string]: unknown }
}
