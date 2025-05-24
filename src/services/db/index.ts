import { agentConfigService } from './agentConfigService';
import { personaService } from './personaService';
import { testService } from './testService';
import { testRunService } from './testRunService';
import { metricsService } from './metricsService';
import { personaMappingService } from './personaMappingService';
import { conversationService } from './conversationService';

// Re-export all services in a single object for compatibility
export const dbService = {
  // Agent Config
  getAgentConfigs: agentConfigService.getAgentConfigs.bind(agentConfigService),
  getAllAgentConfigs: agentConfigService.getAllAgentConfigs.bind(agentConfigService),
  getAgentConfigAll: agentConfigService.getAgentConfigAll.bind(agentConfigService),
  saveAgentConfig: agentConfigService.saveAgentConfig.bind(agentConfigService),
  deleteAgentConfig: agentConfigService.deleteAgentConfig.bind(agentConfigService),
  getAgentConfig: agentConfigService.getAgentConfigs.bind(agentConfigService),
  updateValidationRules: agentConfigService.updateValidationRules.bind(agentConfigService),
  
  // Persona
  getPersonas: personaService.getPersonas.bind(personaService),
  getPersonaById: personaService.getPersonaById.bind(personaService),
  createPersona: personaService.createPersona.bind(personaService),
  updatePersona: personaService.updatePersona.bind(personaService),
  deletePersona: personaService.deletePersona.bind(personaService),
  
  // Test Variations
  getTestVariations: testService.getTestVariations.bind(testService),
  createTestVariation: testService.createTestVariation.bind(testService),
  updateTestVariation: testService.updateTestVariation.bind(testService),
  updateScenarioEnabled: testService.updateScenarioEnabled.bind(testService),
  deleteTestScenarios: testService.deleteTestScenarios.bind(testService),
  
  // Persona Mappings
  getPersonaMappingByAgentId: personaMappingService.getPersonaMappingByAgentId.bind(personaMappingService),
  createPersonaMapping: personaMappingService.createPersonaMapping.bind(personaMappingService),
  deletePersonaMapping: personaMappingService.deletePersonaMapping.bind(personaMappingService),
  
  // Test Runs
  createTestRun: testRunService.createTestRun.bind(testRunService),
  getTestRuns: testRunService.getTestRuns.bind(testRunService),
  getAllTestRuns: testRunService.getAllTestRuns.bind(testRunService),
  updateTestRun: testRunService.updateTestRun.bind(testRunService),
  updateTestConversationStatus: testRunService.updateTestConversationStatus.bind(testRunService),
 
  
  // Metrics
  getMetricById: metricsService.getMetricById.bind(metricsService),
  getMetrics: metricsService.getMetrics.bind(metricsService),
  createMetric: metricsService.createMetric.bind(metricsService),
  updateMetric: metricsService.updateMetric.bind(metricsService),
  deleteMetric: metricsService.deleteMetric.bind(metricsService),
  getMetricsForAgent: metricsService.getMetricsForAgent.bind(metricsService),
  
  // Conversation management
saveConversationMessage: conversationService.saveConversationMessage.bind(conversationService),
getConversationMessages: conversationService.getConversationMessages.bind(conversationService),
reconstructMemoryFromDb: conversationService.reconstructMemoryFromDb.bind(conversationService),
createTestConversation: conversationService.createTestConversation.bind(conversationService),
};