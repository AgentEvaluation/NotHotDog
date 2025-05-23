'use client';

import { TestRunsDashboard } from '@/components/tools/test-runs/TestRunsDashboard';
import { Card } from '@/components/ui/card';

export default function RunsPage() {
  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
        <TestRunsDashboard />
    </div>
  );
}