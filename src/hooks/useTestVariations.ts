import { useState, useCallback, useEffect } from 'react';
import { SimplifiedTestCases, TestVariation, TestVariations } from '@/types/variations';
import { useErrorContext } from '@/hooks/useErrorContext';

export function useTestVariations(initialTestId?: string | undefined) {
  const [variations, setVariations] = useState<TestVariations>({});
  const [variationData, setVariationData] = useState<SimplifiedTestCases | null>(null);
  const [loading, setLoading] = useState(false);
  const errorContext = useErrorContext();

  // Load variations when testId changes
  const loadVariations = useCallback(async (testId: string) => {
    if (!testId) return;
    
    setLoading(true);
    try {
      await errorContext.withErrorHandling(async () => {
        const response = await fetch(`/api/tools/test-variations?testId=${testId}`);
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to load test variations');
        }
        const data = await response.json();
        setVariationData(data.data);
      }, false);
    } finally {
      setLoading(false);
    }
  }, [errorContext]);

  // Initialize data if initialTestId is provided
  useEffect(() => {
    if (initialTestId) {
      loadVariations(initialTestId);
    }
  }, [initialTestId, loadVariations]);

  const addVariation = useCallback(async (newVariation: TestVariation) => {
    setLoading(true);
    try {
      return await errorContext.withErrorHandling(async () => {
        const response = await fetch('/api/tools/test-variations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ variation: newVariation }),
        });
        
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to add variation');
        }
        
        const data = await response.json();
        
        setVariations(prev => ({
          ...prev,
          [newVariation.testId]: [...(prev[newVariation.testId] || []), data.data.variation]
        }));
        
        return data.data;
      }, false);
    } finally {
      setLoading(false);
    }
  }, [errorContext]);

  const updateVariation = useCallback(async (variation: TestVariation) => {
    setLoading(true);
    try {
      return await errorContext.withErrorHandling(async () => {
        const response = await fetch('/api/tools/test-variations', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ variation }),
        });
        
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to update variation');
        }
        
        setVariations(prev => {
          const testVariations = prev[variation.testId] || [];
          return {
            ...prev,
            [variation.testId]: [...testVariations, variation]
          };
        });
        
        return true;
      }, false);
    } finally {
      setLoading(false);
    }
  }, [errorContext]);

  const deleteVariation = useCallback(async (variation: TestVariation) => {
    setLoading(true);
    try {
      return await errorContext.withErrorHandling(async () => {
        const response = await fetch('/api/tools/test-variations', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ variation }),
        });
        
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to delete variation');
        }
        
        return await response.json();
      }, false);
    } finally {
      setLoading(false);
    }
  }, [errorContext]);
  
  const toggleScenarioEnabled = useCallback(async (testId: string, scenarioId: string, enabled: boolean) => {
    setLoading(true);
    try {
      return await errorContext.withErrorHandling(async () => {
        const response = await fetch('/api/tools/test-variations?action=toggleEnabled', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ scenarioId, enabled }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to update scenario status');
        }
        
        const data = await response.json();
        
        if (variationData) {
          setVariationData({
            ...variationData,
            testCases: variationData.testCases.map(tc => 
              tc.id === scenarioId ? { ...tc, enabled } : tc
            )
          });
        }
        
        return data;
      }, false);
    } finally {
      setLoading(false);
    }
  }, [errorContext, variationData]);
  
  return {
    variations,
    loading,
    error: errorContext.error,
    addVariation,
    updateVariation,
    variationData,
    deleteVariation,
    setLoading,
    toggleScenarioEnabled,
    loadVariations,
    clearError: errorContext.clearError
  };
}