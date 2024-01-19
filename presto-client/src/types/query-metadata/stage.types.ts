import { StageExecutionState } from './enums'
import { ExecutionFailureInfo } from './error.types'
import { RuntimeStats } from './runtime-stats.types'

export interface StageInfo {
  stageId: number
  self: string
  plan?: unknown // Cutting the PlanFragment class since it's too complex
  latestAttemptExecutionInfo: StageExecutionInfo
  previousAttemptsExecutionInfos: StageExecutionInfo[]
  subStages: StageInfo[]
  isRuntimeOptimized: boolean
}

export interface StageExecutionInfo {
  state: StageExecutionState
  stats: StageExecutionStats
  tasks: unknown[]
  failureCause?: ExecutionFailureInfo
}

export interface StageExecutionStats {
  schedulingComplete: string
  getSplitDistribution: DistributionSnapshot
  totalTasks: number
  runningTasks: number
  completedTasks: number
  totalLifespans: number
  completedLifespans: number
  totalDrivers: number
  queuedDrivers: number
  runningDrivers: number
  blockedDrivers: number
  completedDrivers: number
  cumulativeUserMemory: number
  cumulativeTotalMemory: number
  userMemoryReservation: string
  totalMemoryReservation: string
  peakUserMemoryReservation: string
  peakNodeTotalMemoryReservation: string
  totalScheduledTime: string
  totalCpuTime: string
  retriedCpuTime: string
  totalBlockedTime: string
  fullyBlocked: boolean
  blockedReasons: Set<string>
  totalAllocation: string
  rawInputDataSize: string
  rawInputPositions: number
  processedInputDataSize: string
  processedInputPositions: number
  bufferedDataSize: string
  outputDataSize: string
  outputPositions: number
  physicalWrittenDataSize: string
  gcInfo: StageGcStatistics
  operatorSummaries: OperatorStats[]
  runtimeStats: RuntimeStats
}

export interface StageGcStatistics {
  stageId: number
  stageExecutionId: number
  tasks: number
  fullGcTasks: number
  minFullGcSec: number
  maxFullGcSec: number
  totalFullGcSec: number
  averageFullGcSec: number
}

export interface DistributionSnapshot {
  maxError: string
  count: number
  total: number
  p01: number
  p05: number
  p10: number
  p25: number
  p50: number
  p75: number
  p90: number
  p95: number
  p99: number
  min: number
  max: number
  avg: string
}

export interface OperatorStats {
  stageId: number
  stageExecutionId: number
  pipelineId: number
  operatorId: number
  planNodeId: string
  operatorType: string
  totalDrivers: number
  addInputCalls: number
  addInputWall: string
  addInputCpu: string
  addInputAllocation: string
  rawInputDataSize: string
  rawInputPositions: number
  inputDataSize: string
  inputPositions: number
  sumSquaredInputPositions: number
  getOutputCalls: number
  getOutputWall: string
  getOutputCpu: string
  getOutputAllocation: string
  outputDataSize: string
  outputPositions: number
  physicalWrittenDataSize: string
  additionalCpu: string
  blockedWall: string
  finishCalls: number
  finishWall: string
  finishCpu: string
  finishAllocation: string
  userMemoryReservation: string
  revocableMemoryReservation: string
  systemMemoryReservation: string
  peakUserMemoryReservation: string
  peakSystemMemoryReservation: string
  peakTotalMemoryReservation: string
  spilledDataSize: string
  blockedReason?: string
  info?: OperatorInfo
  infoUnion?: unknown
  runtimeStats: RuntimeStats
  nullJoinBuildKeyCount: number
  joinBuildKeyCount: number
  nullJoinProbeKeyCount: number
  joinProbeKeyCount: number
}

export interface OperatorInfo {
  '@type': string
  bufferedBytes: number
  maxBufferedBytes: number
  averageBytesPerRequest: number
  successfulRequestsCount: number
  bufferedPages: number
  noMoreLocations: boolean
  pageBufferClientStatuses: unknown[]
}
