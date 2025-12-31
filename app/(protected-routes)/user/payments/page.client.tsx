'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import BalanceCard from '../components/ui/card/BalanceCard';
import formatCurrency from '@/lib/formatCurrency';
import PaymentMethodCard from '../components/ui/card/PaymentMethodCard';
import { IconWallet } from '@tabler/icons-react';
import { PageHeader } from '../components/ui/PageHeader';

type Tx = {
    id: string;
    merchant: string;
    date: string;
    amount: number;
    status?: string;
};

const sampleTx: Tx[] = [
    { id: '1', merchant: 'Wash & Fold', date: 'Nov 26', amount: -12.5, status: 'Completed' },
    { id: '2', merchant: 'Dry Cleaning', date: 'Nov 24', amount: -8.0, status: 'Completed' },
    { id: '3', merchant: 'Top-up', date: 'Nov 23', amount: 25.0, status: 'Completed' },
    { id: '4', merchant: 'Pickup Fee', date: 'Nov 22', amount: -3.5, status: 'Pending' },
    { id: '5', merchant: 'Promo Credit', date: 'Nov 20', amount: 5.0, status: 'Completed' },
];

export default function PaymentPageClient() {
    const [transactions, setTransactions] = useState<Tx[]>(sampleTx);
    const [balance, setBalance] = useState<number>(transactions.reduce((s, t) => s + t.amount, 0));

    const handleBalanceTopUp = async (amount: number) => {
        setBalance(balance + amount);
        setTransactions([...transactions, { id: Date.now().toString(), merchant: 'Top-up', date: new Date().toLocaleDateString(), amount, status: 'Completed' }]);
    };

    return (
        <div className="flex-1 flex flex-col gap-6 p-4 w-full max-w-md mx-auto select-none h-full">
            <PageHeader title="Payments" description="Manage your balance and transactions" icon={IconWallet} />

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.05 }}
                className="space-y-4 w-full"
            >
                {/* Balance Card */}
                <BalanceCard balance={balance} onTopUp={(amount) => handleBalanceTopUp(amount)} />

                {/* Payment Method Card */}
                <PaymentMethodCard />

                {/* Recent Transactions */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-3 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-bold text-indigo-500">Recent Transactions</div>
                        <div className="text-xs text-gray-500">Showing 5</div>
                    </div>

                    <ul className="divide-y divide-gray-100">
                        {transactions.map((t) => (
                            <li key={t.id} className="py-3 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${t.amount < 0 ? 'bg-red-500' : 'bg-green-500'}`}>
                                        <span className="text-[10px] font-semibold wrap-break-word break-all text-white">{t.merchant.split(' ').slice(0,1)[0]}</span>
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-black">{t.merchant}</div>
                                        <div className="text-xs text-gray-500">{t.date} · {t.status}</div>
                                    </div>
                                </div>
                                <div className="text-sm font-medium {t.amount < 0 ? 'text-red-600' : 'text-green-600'}">
                                    <span className={`${t.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>{formatCurrency(t.amount)}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </motion.div>
        </div>
    );
}