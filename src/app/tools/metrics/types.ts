export type MetricType =
  | "Binary Qualitative"
  | "Numeric"
  | "Binary Workflow Adherence"
  | "Continuous Qualitative"
  | "Enum"

export type Criticality = "Low" | "Medium" | "High"

export interface Metric {
  id: string
  name: string
  description?: string
  type: MetricType
  successCriteria?: string
  criticality?: Criticality
  createdAt?: string
}
