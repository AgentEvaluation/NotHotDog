export interface ExtendedTestConversation {
    id: string;
    run_id: string;
    scenario_id: string;
    persona_id: string;
    status: string;
    error_message: string | null;
    created_at: Date | null;
    validation_reason: string | null;
    is_correct: boolean | null;
    conversation_messages: {
      id: string;
      conversation_id: string;
      role: string;
      content: string;
      response_time: number | null;
      validation_score: number | null;
      metrics: unknown;
    }[];
  }
  