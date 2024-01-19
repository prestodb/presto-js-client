import { ErrorType, QueryState, QueryType } from './enums'
import { ErrorCode, ExecutionFailureInfo, PrestoWarning } from './error.types'
import { QueryStats } from './query-stats.types'
import { SessionRepresentation } from './session.types'
import { StageInfo } from './stage.types'

export interface PlanOptimizerInformation {
  optimizerName: string
  optimizerTriggered: boolean
}

export interface QueryInfo {
  queryId: string
  session: SessionRepresentation
  state: QueryState
  memoryPool: string
  scheduled: boolean
  self: string
  fieldNames: string[]
  query: string
  queryHash: string
  expandedQuery?: string
  preparedQuery?: string
  queryStats: QueryStats
  setCatalog?: string
  setSchema?: string
  setSessionProperties: { [key: string]: string }
  resetSessionProperties: Set<string>
  setRoles: { [key: string]: unknown }
  addedPreparedStatements: { [key: string]: string }
  deallocatedPreparedStatements: Set<string>
  startedTransactionId?: string
  clearTransactionId: boolean
  updateType: string
  outputStage?: StageInfo
  failureInfo: ExecutionFailureInfo
  errorType: ErrorType
  errorCode: ErrorCode
  warnings: PrestoWarning[]
  inputs: unknown[]
  output?: unknown
  finalQueryInfo: boolean
  resourceGroupId?: string[]
  queryType?: QueryType
  failedTasks?: string[]
  runtimeOptimizedStages?: number[]
  addedSessionFunctions: unknown
  removedSessionFunctions: unknown
  planStatsAndCosts: unknown
  optimizerInformation: PlanOptimizerInformation[]
  cteInformationList?: unknown[]
  scalarFunctions: Set<string>
  aggregateFunctions: Set<string>
  windowsFunctions: Set<string>
  planCanonicalInfo: unknown[]
  planIdNodeMap?: unknown
  prestoSparkExecutionContext?: unknown
}
