'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api/client';

interface SavingsAccount {
  id: string;
  label: string;
  targetAmount: string | null;
  balance: string;
  createdAt: string;
}

export default function SavingsPage() {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [label, setLabel] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [activeAccount, setActiveAccount] = useState<SavingsAccount | null>(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const { data: accounts = [] } = useQuery<SavingsAccount[]>({
    queryKey: ['savings'],
    queryFn: async () => (await apiClient.get('/savings')).data,
  });

  const createAccount = useMutation({
    mutationFn: () =>
      apiClient.post('/savings', { label, targetAmount: targetAmount || undefined }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['savings'] });
      setShowCreate(false);
      setLabel('');
      setTargetAmount('');
      setError('');
    },
    onError: (err: any) => setError(err.response?.data?.detail ?? 'Create failed'),
  });

  const deposit = useMutation({
    mutationFn: () =>
      apiClient.post('/savings/deposit', {
        savingsAccountId: activeAccount!.id,
        amount: depositAmount,
      }),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['savings'] });
      qc.invalidateQueries({ queryKey: ['wallet-dashboard'] });
      setMessage(`Deposited ${parseFloat(depositAmount).toFixed(2)} AFRi`);
      setDepositAmount('');
      setError('');
    },
    onError: (err: any) => setError(err.response?.data?.detail ?? 'Deposit failed'),
  });

  const withdraw = useMutation({
    mutationFn: () =>
      apiClient.post('/savings/withdraw', {
        savingsAccountId: activeAccount!.id,
        amount: withdrawAmount,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['savings'] });
      qc.invalidateQueries({ queryKey: ['wallet-dashboard'] });
      setMessage(`Withdrew ${parseFloat(withdrawAmount).toFixed(2)} AFRi`);
      setWithdrawAmount('');
      setError('');
    },
    onError: (err: any) => setError(err.response?.data?.detail ?? 'Withdrawal failed'),
  });

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Savings</h1>
          <p className="text-gray-500 text-sm mt-1">Set goals and save in AFRi</p>
        </div>
        <button className="btn-primary" onClick={() => setShowCreate(true)}>
          + New goal
        </button>
      </div>

      {showCreate && (
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-800">New savings goal</h2>
          <div>
            <label className="label">Goal name</label>
            <input
              type="text"
              placeholder="Emergency Fund, New Laptop…"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="label">Target amount in AFRi (optional)</label>
            <input
              type="number"
              min="0"
              placeholder="500.00"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              className="input"
            />
          </div>
          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
          )}
          <div className="flex gap-3">
            <button className="btn-secondary flex-1" onClick={() => setShowCreate(false)}>Cancel</button>
            <button
              className="btn-primary flex-1"
              disabled={!label || createAccount.isPending}
              onClick={() => createAccount.mutate()}
            >
              {createAccount.isPending ? 'Creating…' : 'Create'}
            </button>
          </div>
        </div>
      )}

      {message && (
        <div className="rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
          {message}
        </div>
      )}

      {accounts.length === 0 ? (
        <div className="card text-center py-10 text-gray-400 text-sm">
          No savings goals yet. Create one to start saving.
        </div>
      ) : (
        <div className="space-y-4">
          {accounts.map((acct) => {
            const balance = parseFloat(acct.balance);
            const target = acct.targetAmount ? parseFloat(acct.targetAmount) : null;
            const progress = target ? Math.min(100, (balance / target) * 100) : null;
            const isActive = activeAccount?.id === acct.id;

            return (
              <div key={acct.id} className="card space-y-4">
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => {
                    setActiveAccount(isActive ? null : acct);
                    setMessage('');
                    setError('');
                  }}
                >
                  <div>
                    <p className="font-medium text-gray-800">{acct.label}</p>
                    <p className="text-2xl font-bold text-brand-600 mt-1">
                      {balance.toFixed(2)} <span className="text-sm font-normal text-gray-400">AFRi</span>
                    </p>
                    {target && (
                      <p className="text-xs text-gray-400">
                        Target: {target.toFixed(2)} AFRi
                      </p>
                    )}
                  </div>
                  <span className="text-gray-400 text-sm">{isActive ? '▲' : '▼'}</span>
                </div>

                {progress !== null && (
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-brand-500 h-2 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}

                {isActive && (
                  <div className="pt-2 border-t border-gray-100 space-y-3">
                    {error && (
                      <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
                    )}
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="0.01"
                        placeholder="Deposit amount"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        className="input flex-1"
                      />
                      <button
                        className="btn-primary px-4"
                        disabled={!depositAmount || deposit.isPending}
                        onClick={() => deposit.mutate()}
                      >
                        {deposit.isPending ? '…' : 'Deposit'}
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="0.01"
                        placeholder="Withdraw amount"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        className="input flex-1"
                      />
                      <button
                        className="btn-secondary px-4"
                        disabled={!withdrawAmount || withdraw.isPending}
                        onClick={() => withdraw.mutate()}
                      >
                        {withdraw.isPending ? '…' : 'Withdraw'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
