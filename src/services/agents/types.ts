import { BaseMessage } from "@langchain/core/messages";
import { ApiConfig } from "./claude/types";

export interface Agent {
  call(input: string): Promise<AgentResponse>;
  reset(): void;
}


export interface AgentResponse {
  response: string;
  messages: BaseMessage[];
}

export interface QaAgentConfig {
  modelId: string;
  provider: string;
  headers: Record<string, string>;
  endpointUrl: string;
  apiConfig: ApiConfig;
  persona?: string;
  userApiKey: string;
  extraParams?: Record<string, any>;
}