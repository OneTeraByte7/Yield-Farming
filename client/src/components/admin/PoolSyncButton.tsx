import React, { useState } from 'react';
import { Button } from '@/components/common/Button';
import { RefreshCw, Check, X } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/axios';
import toast from 'react-hot-toast';

export const PoolSyncButton: React.FC = () => {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');

  const syncMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/pools/sync');
      return response.data;
    },
    onSuccess: () => {
      setStatus('success');
      queryClient.invalidateQueries({ queryKey: ['pools'] });
      toast.success('Pools synced successfully!');
      setTimeout(() => setStatus('idle'), 3000);
    },
    onError: (error: unknown) => {
      setStatus('error');
      let errorMessage = 'Failed to sync pools';

      type ApiError = {
        response?: {
          data?: {
            error?: string;
          };
        };
      };

      const err = error as ApiError;
      if (
        typeof error === 'object' &&
        error !== null &&
        'response' in err &&
        typeof err.response === 'object' &&
        err.response !== null &&
        'data' in err.response &&
        typeof err.response.data === 'object' &&
        err.response.data !== null &&
        'error' in err.response.data &&
        typeof err.response.data.error === 'string'
      ) {
        errorMessage = err.response.data.error as string;
      }
      toast.error(errorMessage);
      setTimeout(() => setStatus('idle'), 3000);
    },
  });

  const handleSync = () => {
    setStatus('syncing');
    syncMutation.mutate();
  };

  return (
    <Button
      onClick={handleSync}
      disabled={status === 'syncing'}
      variant={status === 'success' ? 'primary' : 'secondary'}
      className="flex items-center space-x-2"
    >
      {status === 'syncing' && <RefreshCw className="w-4 h-4 animate-spin" />}
      {status === 'success' && <Check className="w-4 h-4" />}
      {status === 'error' && <X className="w-4 h-4" />}
      {status === 'idle' && <RefreshCw className="w-4 h-4" />}
      <span>
        {status === 'syncing' && 'Syncing...'}
        {status === 'success' && 'Synced!'}
        {status === 'error' && 'Failed'}
        {status === 'idle' && 'Sync Pools'}
      </span>
    </Button>
  );
};