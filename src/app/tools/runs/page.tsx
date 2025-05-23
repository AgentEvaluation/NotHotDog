'use client';

import { TestRunsDashboard } from '@/components/tools/test-runs/TestRunsDashboard';
import { Card } from '@/components/ui/card';

export default function RunsPage() {
  return (
    <div className="p-6">
        <TestRunsDashboard />
    </div>
  );
}