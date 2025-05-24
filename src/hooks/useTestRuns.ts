import { useState, useEffect } from 'react';
import { TestRun } from '@/types/runs';
import { useErrorContext } from '@/hooks/useErrorContext';

export function useTestRuns() {
  const [runs, setRuns] = useState<TestRun[]>([]);
  const [selectedRun, setSelectedRun] = useState<TestRun | null>(null);
  const errorContext = useErrorContext();

  useEffect(() => {
    const controller = new AbortController();
    loadRuns(controller.signal);
    
    return () => {
      controller.abort();
    };
  }, []);

  const loadRuns = async (signal?: AbortSignal) => {
    await errorContext.withErrorHandling(async () => {
      const res = await fetch('/api/tools/test-runs', { signal });
      if (signal?.aborted) return;
      
      const response = await res.json();
      const savedRuns = response.data || response || [];
      setRuns(Array.isArray(savedRuns) ? savedRuns : []);
    });
  };

  const addRun = async (newRun: TestRun) => {
      setRuns(prev => [newRun, ...prev]); 
  };

  const updateRun = async (updatedRun: TestRun) => {
    await errorContext.withErrorHandling(async () => {
      await fetch('/api/tools/test-runs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedRun)
      });
      
      setRuns(prev => {
        const index = prev.findIndex(run => run.id === updatedRun.id);
        if (index === -1) return prev;
        
        const newRuns = [...prev];
        newRuns[index] = updatedRun;
        return newRuns;
      });

      if (selectedRun?.id === updatedRun.id) {
        setSelectedRun(updatedRun);
      }
    });
  };

  return {
    runs,
    selectedRun,
    setSelectedRun,
    addRun,
    updateRun,
    error: errorContext.error,
    clearError: errorContext.clearError,
    isLoading: errorContext.isLoading
  };
}