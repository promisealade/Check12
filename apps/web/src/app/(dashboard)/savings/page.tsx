'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api/client';
import { Icon } from '../../../lib/icons';

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
  const [activeId, setActiveId] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const { data: accounts = [] } = useQuery<SavingsAccount[]>({
    queryKey: ['savings'],
    queryFn: async () => (await apiClient.get<SavingsAccount[]>('/savings')).data,
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
    mutationFn: (acctId: string) =>
      apiClient.post('/savings/deposit', { savingsAccountId: acctId, amount: depositAmount }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['savings'] });
      qc.invalidateQueries({ queryKey: ['wallet-dashboard'] });
      setMessage(`Deposited ${parseFloat(depositAmount).toFixed(2)} AFRi`);
      setDepositAmount('');
      setError('');
    },
    onError: (err: any) => setError(err.response?.data?.detail ?? 'Deposit failed'),
  });

  const withdraw = useMutation({
    mutationFn: (acctId: string) =>
      apiClient.post('/savings/withdraw', { savingsAccountId: acctId, amount: withdrawAmount }),
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
          <h1 className="h1">Savings</h1>
          <p className="subtle mt-1">Set goals and save in AFRi.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowCreate(true)}>
          <Icon name="plus" className="w-4 h-4" /> New goal
        </button>
      </div>

      {showCreate && (
        <div className="card space-y-4">
          <h2 className="font-semibold text-brand-700">New savings goal</h2>
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
          {error && <div className="alert-error">{error}</div>}
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

      {message && <div className="alert-success">{message}</div>}

      {accounts.length === 0 ? (
        <div className="card text-center py-12 space-y-3">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
            <Icon name="bank" className="w-6 h-6" />
          </div>
          <p className="text-sm text-muted-500">No savings goals yet. Create one to start saving.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {accounts.map((acct) => {
            const balance = parseFloat(acct.balance);
            const target = acct.targetAmount ? parseFloat(acct.targetAmount) : null;
            const progress = target ? Math.min(100, (balance / target) * 100) : null;
            const isActive = activeId === acct.id;

            return (
              <div key={acct.id} className="card space-y-4">
                <div
                  className="flex items-start justify-between cursor-pointer gap-3"
                  onClick={() => {
                    setActiveId(isActive ? null : acct.id);
                    setMessage('');
                    setError('');
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gold-100 text-gold-500 flex items-center justify-center shrink-0">
                      <Icon name="star" className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-brand-700">{acct.label}</p>
                      <p className="text-2xl font-semibold text-brand-600 mt-0.5 tabular-nums">
                        {balance.toFixed(2)}
                        <span className="text-sm font-normal text-muted-400 ml-1">AFRi</span>
                      </p>
                      {target && (
                        <p className="text-xs text-muted-400 tabular-nums">
                          Target: {target.toFixed(2)} AFRi
                        </p>
                      )}
                    </div>
                  </div>
                  <Icon
                    name={isActive ? 'arrowUp' : 'arrowDown'}
                    className="w-4 h-4 text-muted-400 mt-3"
                  />
                </div>

                {progress !== null && (
                  <div className="w-full bg-muted-100 rounded-full h-1.5">
                    <div
                      className="bg-brand-500 h-1.5 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}

                {isActive && (
                  <div className="pt-2 border-t border-muted-100 space-y-3">
                    {error && <div className="alert-error">{error}</div>}
                    <div className="flex gap-2">
                      <input
                        type="number" min="0.01" placeholder="Deposit amount"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        className="input flex-1"
                      />
                      <button
                        className="btn-primary px-4"
                        disabled={!depositAmount || deposit.isPending}
                        onClick={() => deposit.mutate(acct.id)}
                      >
                        {deposit.isPending ? '…' : 'Deposit'}
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="number" min="0.01" placeholder="Withdraw amount"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        className="input flex-1"
                      />
                      <button
                        className="btn-secondary px-4"
                        disabled={!withdrawAmount || withdraw.isPending}
                        onClick={() => withdraw.mutate(acct.id)}
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
