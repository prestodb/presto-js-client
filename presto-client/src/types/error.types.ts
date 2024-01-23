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
