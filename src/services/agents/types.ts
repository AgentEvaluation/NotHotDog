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

// Use QaAgentConfig from claude/types.ts which is more complete
export type { QaAgentConfig } from './claude/types';