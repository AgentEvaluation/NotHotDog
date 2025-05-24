import { prisma } from '@/lib/prisma';

// Basic metrics for community edition
const BASIC_METRICS = [
  {
    id: 'response-time',
    name: 'Response Time',
    check_criteria: 'Response time in milliseconds',
    type: 'PERFORMANCE',
    success_criteria: 'Less than 5000ms',
    criticality: 'HIGH'
  },
  {
    id: 'validation-pass',
    name: 'Validation Pass',
    check_criteria: 'Response passes validation rules',
    type: 'FUNCTIONAL',
    success_criteria: 'Validation passes',
    criticality: 'CRITICAL'
  }
];

export class MetricsService {
  async getMetricById(metricId: string) {
    return BASIC_METRICS.find(m => m.id === metricId) || null;
  }

  async getMetrics() {
    return BASIC_METRICS;
  }

  async getMetricsForAgent(agentId: string) {
    // All agents use the same basic metrics in community edition
    return BASIC_METRICS;
  }

  async createMetric() {
    throw new Error('Custom metrics are not available in the community edition');
  }

  async updateMetric() {
    throw new Error('Custom metrics are not available in the community edition');
  }

  async deleteMetric() {
    throw new Error('Custom metrics are not available in the community edition');
  }
}

export const metricsService = new MetricsService();