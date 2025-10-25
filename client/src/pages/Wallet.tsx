import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Modal } from '@/components/common/Modal';
import { Loading } from '@/components/common/Loading';
import { useWallet } from '@/hooks/useWallet';
import { useQuery } from '@tanstack/react-query';
import { walletApi } from '@/api/wallet.api';
import { formatNumber, formatDate } from '@/utils/formatters';
import { Wallet as WalletIcon, ArrowDownLeft, ArrowUpRight, History, Link as LinkIcon } from 'lucide-react';
import { useAppKit } from '@reown/appkit/react';
import { useAccount, useDisconnect } from 'wagmi';

export const Wallet: React.FC = () => {
  const { balance, deposit, withdraw, isDepositing, isWithdrawing } = useWallet();
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [amount, setAmount] = useState('');

  // Web3 wallet connection
  const { open } = useAppKit();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  const { data: transactionsData, isLoading: isLoadingTransactions } = useQuery({
    queryKey: ['wallet-transactions'],
    queryFn: () => walletApi.getTransactions(1, 20),
  });

  const handleDeposit = () => {
    const amountNum = parseFloat(amount);
    if (amountNum > 0) {
      deposit(amountNum, {
        onSuccess: () => {
          setAmount('');
          setShowDepositModal(false);
        },
      });
    }
  };

  const handleWithdraw = () => {
    const amountNum = parseFloat(amount);
    if (amountNum > 0 && amountNum <= balance.balance) {
      withdraw(amountNum, {
        onSuccess: () => {
          setAmount('');
          setShowWithdrawModal(false);
        },
      });
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">Wallet</h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-1">Manage your funds and connect Web3 wallets</p>
        </div>

        {/* Web3 Wallet Connection */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                <LinkIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Web3 Wallet</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
                <span className="hidden sm:inline">Connect your MetaMask, Coinbase Wallet, WalletConnect, or other Web3 wallets</span>
                <span className="sm:hidden">Connect your Web3 wallet</span>
              </p>
            </div>
          </div>

          {isConnected && address ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 gap-3">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center flex-shrink-0">
                  <WalletIcon className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100">
                    Connected Wallet
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-mono">
                    {address.slice(0, 6)}...{address.slice(-4)}
                  </p>
                </div>
              </div>
              <div className="flex space-x-2 w-full sm:w-auto">
                <Button
                  variant="secondary"
                  onClick={() => open()}
                  size="sm"
                  className="text-xs sm:text-sm flex-1 sm:flex-none"
                >
                  View Details
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => disconnect()}
                  size="sm"
                  className="text-xs sm:text-sm flex-1 sm:flex-none"
                >
                  Disconnect
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 sm:py-8">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-primary-500/12 dark:bg-primary-900/35 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-royal">
                <WalletIcon className="w-7 h-7 sm:w-8 sm:h-8 text-primary-500 dark:text-primary-300" />
              </div>
              <h4 className="text-base sm:text-lg font-medium text-slate-900 dark:text-slate-100 mb-2 px-4">
                No Web3 Wallet Connected
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mb-4 px-4">
                <span className="hidden sm:inline">Connect your wallet to interact with DeFi protocols and manage crypto assets</span>
                <span className="sm:hidden">Connect your wallet to manage crypto assets</span>
              </p>
              <div className="mt-4 sm:mt-6 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <button
                  onClick={() => open()}
                  className="flex flex-col items-center p-3 sm:p-4 bg-white/18 dark:bg-slate-900/45 border border-primary-500/20 hover:border-primary-500/40 rounded-xl sm:rounded-2xl transition-all duration-200 hover:shadow-royal hover:-translate-y-1 group backdrop-blur-2xl"
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 mb-2 sm:mb-3 flex items-center justify-center bg-primary-500/12 dark:bg-primary-900/35 rounded-xl sm:rounded-2xl group-hover:bg-primary-500/20 dark:group-hover:bg-primary-900/45 transition-colors">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg"
                      alt="MetaMask"
                      className="w-7 h-7 sm:w-9 sm:h-9"
                    />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-primary-400">MetaMask</span>
                  <span className="text-xs text-slate-500 dark:text-slate-300 mt-0.5 sm:mt-1 hidden sm:block">Browser Extension</span>
                </button>
                <button
                  onClick={() => open()}
                  className="flex flex-col items-center p-3 sm:p-4 bg-white/18 dark:bg-slate-900/45 border border-primary-500/20 hover:border-primary-500/40 rounded-xl sm:rounded-2xl transition-all duration-200 hover:shadow-royal hover:-translate-y-1 group backdrop-blur-2xl"
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 mb-2 sm:mb-3 flex items-center justify-center bg-primary-500/12 dark:bg-primary-900/35 rounded-xl sm:rounded-2xl group-hover:bg-primary-500/20 dark:group-hover:bg-primary-900/45 transition-colors">
                    <img
                      src="https://avatars.githubusercontent.com/u/18060234"
                      alt="Coinbase Wallet"
                      className="w-7 h-7 sm:w-9 sm:h-9 rounded-full"
                    />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-primary-400">Coinbase</span>
                  <span className="text-xs text-slate-500 dark:text-slate-300 mt-0.5 sm:mt-1 hidden sm:block">Mobile & Desktop</span>
                </button>
                <button
                  onClick={() => open()}
                  className="flex flex-col items-center p-3 sm:p-4 bg-white/18 dark:bg-slate-900/45 border border-primary-500/20 hover:border-primary-500/40 rounded-xl sm:rounded-2xl transition-all duration-200 hover:shadow-royal hover:-translate-y-1 group backdrop-blur-2xl"
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 mb-2 sm:mb-3 flex items-center justify-center bg-primary-500/12 dark:bg-primary-900/35 rounded-xl sm:rounded-2xl group-hover:bg-primary-500/20 dark:group-hover:bg-primary-900/45 transition-colors">
                    <img
                      src="https://avatars.githubusercontent.com/u/37784886"
                      alt="WalletConnect"
                      className="w-7 h-7 sm:w-9 sm:h-9"
                    />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-primary-400">WalletConnect</span>
                  <span className="text-xs text-slate-500 dark:text-slate-300 mt-0.5 sm:mt-1 hidden sm:block">All Wallets</span>
                </button>
                <button
                  onClick={() => open()}
                  className="flex flex-col items-center p-3 sm:p-4 bg-white/18 dark:bg-slate-900/45 border border-primary-500/20 hover:border-primary-500/40 rounded-xl sm:rounded-2xl transition-all duration-200 hover:shadow-royal hover:-translate-y-1 group backdrop-blur-2xl"
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 mb-2 sm:mb-3 flex items-center justify-center bg-primary-500/12 dark:bg-primary-900/35 rounded-xl sm:rounded-2xl group-hover:bg-primary-500/20 dark:group-hover:bg-primary-900/45 transition-colors">
                    <WalletIcon className="w-6 h-6 sm:w-7 sm:h-7 text-slate-500 dark:text-slate-300 group-hover:text-white" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-primary-400">More</span>
                  <span className="text-xs text-slate-500 dark:text-slate-300 mt-0.5 sm:mt-1 hidden sm:block">View All Options</span>
                </button>
              </div>
            </div>
          )}
        </Card>

        {/* Balance Card */}
        <Card>
          <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                <WalletIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">Available Balance</p>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
                  ${formatNumber(balance.balance)}
                </p>
              </div>
            </div>
            <div className="flex space-x-2 sm:space-x-3 w-full sm:w-auto">
              <Button
                onClick={() => setShowDepositModal(true)}
                className="flex items-center justify-center space-x-2 flex-1 sm:flex-none"
                size="sm"
              >
                <ArrowDownLeft className="w-4 h-4" />
                <span>Deposit</span>
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowWithdrawModal(true)}
                className="flex items-center justify-center space-x-2 flex-1 sm:flex-none"
                size="sm"
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>Withdraw</span>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700">
            <div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">Staked Balance</p>
              <p className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-slate-100">
                ${formatNumber(balance.stakedBalance)}
              </p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">Pending Rewards</p>
              <p className="text-lg sm:text-xl font-semibold text-green-600 dark:text-green-400">
                ${formatNumber(balance.pendingRewards)}
              </p>
            </div>
          </div>
        </Card>

        {/* Transaction History */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
              <History className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Transaction History</span>
            </h3>
          </div>

          {isLoadingTransactions ? (
            <Loading />
          ) : transactionsData?.transactions.length === 0 ? (
            <div className="text-center py-6 sm:py-8 text-sm sm:text-base text-slate-500 dark:text-slate-300">
              No transactions yet
            </div>
          ) : (
            <div className="space-y-2">
              {transactionsData?.transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 sm:p-3 bg-white/12 dark:bg-slate-900/45 border border-primary-500/20 rounded-xl backdrop-blur-xl"
                >
                  <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                    <div
                      className={`p-1.5 sm:p-2 rounded-lg flex-shrink-0 ${
                        tx.type === 'deposit'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                          : tx.type === 'withdraw'
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                          : 'bg-primary-500/10 dark:bg-primary-500/20 text-primary-500 dark:text-primary-300'
                      }`}
                    >
                      {tx.type === 'deposit' ? (
                        <ArrowDownLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                      ) : (
                        <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm sm:text-base font-medium text-slate-900 dark:text-slate-100 capitalize">
                        {tx.type}
                      </p>
                      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-300 truncate">
                        {formatDate(tx.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <p
                      className={`text-sm sm:text-base font-semibold ${
                        tx.type === 'deposit'
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-slate-900 dark:text-slate-100'
                      }`}
                    >
                      {tx.type === 'deposit' ? '+' : '-'}$
                      {formatNumber(tx.amount)}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-300">{tx.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Deposit Modal */}
      <Modal
        isOpen={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        title="Deposit Funds"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Add funds to your wallet to start staking
          </p>
          <Input
            label="Amount (USD)"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            min="0.01"
            step="0.01"
          />
          <div className="flex space-x-3">
            <Button
              variant="secondary"
              onClick={() => setShowDepositModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeposit}
              isLoading={isDepositing}
              disabled={!amount || parseFloat(amount) <= 0}
              className="flex-1"
            >
              Deposit
            </Button>
          </div>
        </div>
      </Modal>

      {/* Withdraw Modal */}
      <Modal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        title="Withdraw Funds"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Available balance: ${formatNumber(balance.balance)}
          </p>
          <Input
            label="Amount (USD)"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            min="0.01"
            max={balance.balance}
            step="0.01"
          />
          {parseFloat(amount) > balance.balance && (
            <p className="text-sm text-red-500">Insufficient balance</p>
          )}
          <div className="flex space-x-3">
            <Button
              variant="secondary"
              onClick={() => setShowWithdrawModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleWithdraw}
              isLoading={isWithdrawing}
              disabled={
                !amount ||
                parseFloat(amount) <= 0 ||
                parseFloat(amount) > balance.balance
              }
              className="flex-1"
            >
              Withdraw
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};  