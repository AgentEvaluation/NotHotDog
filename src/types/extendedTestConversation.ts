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
      is_correct: boolean | null;
      response_time: number | null;
      validation_score: number | null;
      metrics: unknown;
    }[];
    test_run_metrics?: {
        id: string;
        metric_id: string;
        score: number;
        reason: string | null;
        metrics: {
          id: string;
          name: string;
          type: string;
          check_criteria: string;
        }
      }[];
  }
  