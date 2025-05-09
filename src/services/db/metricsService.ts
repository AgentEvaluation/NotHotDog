import { prisma } from '@/lib/prisma';

export class MetricsService {
  async getMetricById(metricId: string) {
    try {
      const metric = await prisma.metrics.findUnique({
        where: { id: metricId },
        include: {
          agent_metrics: true
        }
      });
      
      if (!metric) return null;
      
      return {
        id: metric.id,
        name: metric.name,
        type: metric.type,
        description: metric.check_criteria,
        successCriteria: metric.success_criteria,
        criticality: metric.criticality,
        createdAt: metric.created_at,
        agentIds: metric.agent_metrics.map((am: { agent_id: string }) => am.agent_id)
      };
    } catch (error) {
      console.error("Database error in getMetricById:", error);
      throw new Error("Failed to fetch metric");
    }
  }

  async getMetrics(userId: string): Promise<any[]> {
    try {
      const profile = await prisma.profiles.findUnique({
        where: { clerk_id: userId }
      });
      
      if (!profile || !profile.org_id) {
        return [];
      }
      
      const metrics = await prisma.metrics.findMany({
        where: {
          org_id: profile.org_id
        }
      });
      
      return metrics.map(metric => ({
        id: metric.id,
        name: metric.name,
        type: metric.type,
        description: metric.check_criteria,
        successCriteria: metric.success_criteria,
        criticality: metric.criticality,
        createdAt: metric.created_at
      }));
    } catch (error) {
      console.error("Database error in getMetrics:", error);
      return [];
    }
  }
  
  async createMetric(data: {
    name: string;
    type: string;
    description?: string;
    successCriteria?: string;
    criticality: string;
    org_id: string;
    created_by: string;
    agentIds?: string[];
  }) {
    try {
      const newMetric = await prisma.metrics.create({
        data: {
          org_id: data.org_id,
          name: data.name,
          check_criteria: data.description || "",
          type: data.type,
          success_criteria: data.successCriteria || "",
          criticality: data.criticality,
          created_by: data.created_by
        }
      });

      if (data.agentIds && data.agentIds.length > 0) {
        await prisma.agent_metrics.createMany({
          data: data.agentIds.map(agentId => ({
            metric_id: newMetric.id,
            agent_id: agentId,
            enabled: true
          }))
        });
      }
      
      return {
        id: newMetric.id,
        name: newMetric.name,
        type: newMetric.type,
        description: newMetric.check_criteria,
        successCriteria: newMetric.success_criteria,
        criticality: newMetric.criticality,
        createdAt: newMetric.created_at
      };
    } catch (error) {
      console.error("Database error in createMetric:", error);
      throw new Error("Failed to create metric");
    }
  }
  
  async deleteMetric(id: string) {
    try {
      // First delete all agent_metrics associations
      await prisma.agent_metrics.deleteMany({
        where: { metric_id: id }
      });
      
      // Then delete the metric
      await prisma.metrics.delete({
        where: { id }
      });
      
      return { success: true };
    } catch (error) {
      console.error("Database error in deleteMetric:", error);
      throw new Error("Failed to delete metric");
    }
  }

  // Add to src/services/db/metricsService.ts
    async updateMetric(id: string, data: {
        name: string;
        type: string;
        description?: string;
        successCriteria?: string;
        criticality: string;
        agentIds?: string[];
    }) {
        try {
        // First update the metric itself
        const updatedMetric = await prisma.metrics.update({
            where: { id },
            data: {
            name: data.name,
            type: data.type,
            check_criteria: data.description || "",
            success_criteria: data.successCriteria || "",
            criticality: data.criticality
            }
        });
        
        // If agent IDs were provided, update the metric-agent mappings
        if (data.agentIds) {
            // First delete all existing mappings
            await prisma.agent_metrics.deleteMany({
            where: { metric_id: id }
            });
            
            // Then create new mappings
            if (data.agentIds.length > 0) {
            await prisma.agent_metrics.createMany({
                data: data.agentIds.map(agentId => ({
                metric_id: id,
                agent_id: agentId,
                enabled: true
                }))
            });
            }
        }
        
        return {
            id: updatedMetric.id,
            name: updatedMetric.name,
            type: updatedMetric.type,
            description: updatedMetric.check_criteria,
            successCriteria: updatedMetric.success_criteria,
            criticality: updatedMetric.criticality,
            createdAt: updatedMetric.created_at,
            agentIds: data.agentIds || []
        };
        } catch (error) {
        console.error("Database error in updateMetric:", error);
        throw new Error("Failed to update metric");
        }
    }
  
  async getMetricsForAgent(agentId: string) {
    try {
      return await prisma.metrics.findMany({
        where: {
          agent_metrics: {
            some: { agent_id: agentId, enabled: true }
          }
        }
      });
    } catch (error) {
      console.error("Error fetching metrics for agent:", error);
      return [];
    }
  }
}

export const metricsService = new MetricsService();