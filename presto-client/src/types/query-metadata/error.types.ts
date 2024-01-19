import { ErrorType } from './enums'

export interface ExecutionFailureInfo {
  type: string
  message: string
  cause?: ExecutionFailureInfo
  suppressed: ExecutionFailureInfo[]
  stack: string[]
  errorCode?: ErrorCode
  errorCause?: string
}

export interface ErrorCode {
  code: number
  name: string
  type: ErrorType
  retriable: boolean
}

export interface WarningCode {
  code: number
  name: string
}

export interface PrestoWarning {
  warningCode: WarningCode
  message: string
}
