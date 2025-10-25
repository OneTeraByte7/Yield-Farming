import { useQuery } from '@tanstack/react-query';
import { poolApi } from '@/api/pool.api';

export const usePools = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['pools'],
    queryFn: poolApi.getAllPools,
    staleTime: 2 * 60 * 1000, // Consider data fresh for 2 minutes
    refetchInterval: false, // Disable auto-refetch (useRealtimePools handles this)
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });

  return {
    pools: data || [],
    isLoading,
    error,
    refetch,
  };
};

export const usePool = (poolId: string) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['pool', poolId],
    queryFn: () => poolApi.getPoolById(poolId),
    enabled: !!poolId,
  });

  return {
    pool: data,
    isLoading,
    error,
  };
};