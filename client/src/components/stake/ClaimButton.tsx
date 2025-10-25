import React from 'react';
import { Button } from '@/components/common/Button';
import { useStake } from '@/hooks/useStake';
import { Gift } from 'lucide-react';

interface ClaimButtonProps {
  stakeId: string;
  amount: number;
  disabled?: boolean;
}

export const ClaimButton: React.FC<ClaimButtonProps> = ({
  stakeId,
  amount,
  disabled,
}) => {
  const { claimRewards, isClaiming } = useStake();

  const handleClaim = () => {
    claimRewards(stakeId);
  };

  return (
    <Button
      onClick={handleClaim}
      isLoading={isClaiming}
      disabled={disabled || amount <= 0}
      size="sm"
      className="flex items-center space-x-2"
    >
      <Gift className="w-4 h-4" />
      <span>Claim</span>
    </Button>
  );
};