import { useState, useCallback } from 'react';

export const useActionQueue = () => {
  const [queue, setQueue] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const addToQueue = useCallback((items) => {
    setQueue(prev => [...prev, ...items]);
  }, []);

  const processQueue = useCallback(async (actionHandler) => {
    if (isProcessing || queue.length === 0) return;

    setIsProcessing(true);
    
    try {
      const item = queue[0];
      await actionHandler(item);
      setQueue(prev => prev.slice(1));
    } catch (error) {
      console.error('Error processing queue item:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [queue, isProcessing]);

  const clearQueue = useCallback(() => {
    setQueue([]);
  }, []);

  return {
    queue,
    addToQueue,
    processQueue,
    isProcessing,
    clearQueue
  };
}; 