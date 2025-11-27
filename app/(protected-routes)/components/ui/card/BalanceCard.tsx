"use client";

import { useState } from "react";
import formatCurrency from "@/lib/formatCurrency";
import { motion } from "framer-motion";

type Props = {
    balance: number;
    onTopUp?: (amount: number) => void;
};

const BalanceCard = ({ balance, onTopUp }: Props) => {
    const [open, setOpen] = useState(false);
    const [amount, setAmount] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    function reset() {
        setAmount("");
        setError(null);
        setLoading(false);
    }

    async function handleConfirm() {
        setError(null);
        const value = parseFloat(amount);
        if (Number.isNaN(value) || value <= 0) {
            setError("Enter a valid amount greater than 0");
            return;
        }

        setLoading(true);

        try {
            if (onTopUp) {
                await Promise.resolve(onTopUp(value));
            } else {
                await new Promise((r) => setTimeout(r, 300));
            }

            setOpen(false);
            reset();
        } catch (e) {
            setError("Top up failed. Try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <div className="bg-linear-to-r from-indigo-700 to-indigo-500 text-white rounded-2xl p-4 shadow-md">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <div className="text-sm opacity-90">Available balance</div>
                        <div className="mt-2 text-2xl font-medium">{formatCurrency(balance)}</div>
                    </div>
                    <div className="flex flex-col items-end justify-center gap-2">
                        <button
                            onClick={() => setOpen(true)}
                            className="bg-white/20 hover:bg-white/30 text-white text-sm px-3 py-2 rounded-md"
                        >
                            Top up
                        </button>
                    </div>
                </div>
            </div>

            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />

                    <motion.div
                        initial={{ y: -50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -50, opacity: 0 }}
                        className="relative w-full max-w-sm bg-white dark:bg-slate-800 rounded-lg shadow-lg p-5">
                        <h3 className="text-xl text-indigo-600 font-bold">Top up balance</h3>
                        <p className="text-sm text-gray-500 mt-1">Add funds to your account</p>

                        <div className="mt-4">
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-200">Amount</label>
                            <div className="mt-1 flex items-center gap-2">
                                <input
                                    inputMode="decimal"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full rounded-md border text-black border-gray-200 px-3 py-2 text-sm dark:bg-slate-700 dark:border-slate-600"
                                    placeholder="0.00"
                                />
                            </div>
                            {error && <div className="text-sm text-red-600 mt-2">{error}</div>}
                        </div>

                        <div className="mt-5 flex items-center justify-end gap-2">
                            <button
                                onClick={() => {
                                    setOpen(false);
                                    reset();
                                }}
                                className="px-3 py-2 text-sm rounded-md bg-red-600 text-white hover:bg-red-700"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirm}
                                disabled={loading}
                                className="px-3 py-2 text-sm rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
                            >
                                {loading ? 'Processing...' : 'Confirm Top up'}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </>
    );
};

export default BalanceCard;