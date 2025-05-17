import { useState, useEffect, useCallback } from 'react';
import { SimplifiedTestCases, TestVariation, TestVariations } from '@/types/variations';
import { useErrorContext } from '@/hooks/useErrorContext';
import { withErrorHandling } from '@/utils/error-handlers';

export function useTestVariations(testId?: string) {
  const [variations, setVariations] = useState<TestVariations>({});
  const [variationData, setVariationData] = useState<SimplifiedTestCases | null>(null);
  const [loading, setLoading] = useState(false);
  const errorContext = useErrorContext();

  useEffect(() => {
    if (testId) {
      loadVariation(testId);
    }
  }, [testId]);
  
  const loadVariation = async (testId: string) => {
    await withErrorHandling(
      async () => {
        setLoading(true);
        const response = await fetch(`/api/tools/test-variations?testId=${testId}`);
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to load test variations');
        }
        const data = await response.json();
        setVariationData(data.data);
      },
      errorContext,
      { setLoading }
    )();
  };

  const addVariation = useCallback(async (newVariation: TestVariation) => {
    return await withErrorHandling(
      async () => {
        setLoading(true);
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
      },
      errorContext,
      { setLoading }
    )();
  }, [errorContext]);

  const updateVariation = useCallback(async (variation: TestVariation) => {
    return await withErrorHandling(
      async () => {
        setLoading(true);
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
      },
      errorContext,
      { setLoading }
    )();
  }, [errorContext]);

  const deleteVariation = useCallback(async (variation: TestVariation) => {
    return await withErrorHandling(
      async () => {
        setLoading(true);
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
      },
      errorContext,
      { setLoading }
    )();
  }, [errorContext]);
  
  const toggleScenarioEnabled = useCallback(async (testId: string, scenarioId: string, enabled: boolean) => {
    return await withErrorHandling(
      async () => {
        setLoading(true);
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
      },
      errorContext,
      { setLoading }
    )();
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
    clearError: errorContext.clearError
  };
}