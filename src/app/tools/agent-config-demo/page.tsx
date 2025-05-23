'use client';

import AgentConfigWizard from '@/components/tools/AgentConfigWizard';

export default function AgentConfigDemoPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2">Agent Configuration Demo</h1>
      <p className="text-muted-foreground mb-8">
        This is a demo of the improved configuration UI for setting up AI agents
      </p>
      
      <AgentConfigWizard />
    </div>
  );
}