import { RuntimeUnit } from './enums'

export type RuntimeStats = {
  [key: string]: RuntimeMetric
}

export interface RuntimeMetric {
  name: string
  unit: RuntimeUnit
  sum: number
  count: number
  max: number
  min: number
}
