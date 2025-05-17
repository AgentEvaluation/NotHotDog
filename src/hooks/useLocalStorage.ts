import { useState, useEffect } from 'react';
import { useErrorContext } from '@/hooks/useErrorContext';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const errorContext = useErrorContext();
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      errorContext.handleError(error);
      return initialValue;
    }
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      errorContext.handleError(error);
    }
  }, [key, storedValue, errorContext]);

  return [storedValue, setStoredValue] as const;
}