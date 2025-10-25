import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export const useRealtimePools = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Refetch pools every 5 minutes
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['pools'] });
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [queryClient]);
};