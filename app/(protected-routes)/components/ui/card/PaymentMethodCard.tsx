"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CardType } from "@/lib/enums/cardType";

type ManagePayload = {
    cardType?: string;
    cardNumber?: string;
    expiry?: string;
};

type Props = {
    brand?: string;
    last4?: string | number;
    expiry?: string;
    onManage?: (action: 'set-default' | 'replace' | 'remove', payload?: ManagePayload) => Promise<void> | void;
};

const PaymentMethodCard = ({ brand = 'VISA', last4 = '4242', expiry = '12/26', onManage }: Props) => {
    const [open, setOpen] = useState(false);
    const [loadingAction, setLoadingAction] = useState<'set-default' | 'replace' | 'remove' | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [cardType, setCardType] = useState<string>(brand);
    const [cardNumber, setCardNumber] = useState<string>(`•••• ${last4}`);
    const [expiryState, setExpiryState] = useState<string | undefined>(expiry);

    async function handleAction(action: 'set-default' | 'replace' | 'remove', payload?: ManagePayload) {
        setError(null);
        setLoadingAction(action);
        try {
            if (onManage) {
                await Promise.resolve(onManage(action, payload));
            } else {
                // demo delay
                await new Promise((r) => setTimeout(r, 400));
            }

            setOpen(false);
            setLoadingAction(null);
        } catch (e) {
            setError('Action failed. Please try again.');
            setLoadingAction(null);
        }
    }

    return (
        <>
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-8 bg-linear-to-r from-yellow-400 to-orange-500 rounded-md flex items-center justify-center text-sm font-semibold">{brand}</div>
                        <div>
                            <div className="text-sm font-medium text-black">{brand} •••• {last4}</div>
                            <div className="text-xs text-gray-500">Expires {expiry}</div>
                        </div>
                    </div>
                    <div>
                        <button onClick={() => setOpen(true)} className="text-indigo-600 text-sm font-medium">Manage</button>
                    </div>
                </div>
            </div>

            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 text-black">
                    <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />

                    <motion.div
                        initial={{ y: -50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -50, opacity: 0 }}
                        className="relative w-full max-w-sm bg-white dark:bg-slate-800 rounded-lg shadow-lg p-5">
                        <h3 className="text-lg font-bold text-indigo-500">Manage payment method</h3>
                        <p className="text-sm text-gray-500 mt-1">{brand} •••• {last4} · Expires {expiry}</p>
                        <div className="flex flex-col gap-2">
                            <div className="flex flex-row gap-2">
                                <select
                                    value={cardType}
                                    onChange={(e) => setCardType(e.target.value)}
                                    className="mt-4 w-1/2 rounded-md border border-gray-200 px-3 py-2 text-sm dark:bg-slate-700 dark:border-slate-600"
                                >
                                    {CardType && Object.values(CardType).map((type) => (
                                        <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                                    ))}
                                </select>

                                <input
                                    type="text"
                                    className="mt-4 w-1/2 rounded-md border border-gray-200 px-3 py-2 text-sm dark:bg-slate-700 dark:border-slate-600"
                                    placeholder={`MM/YY`}
                                    value={expiryState ?? ''}
                                    onChange={(e) => setExpiryState(e.target.value)}
                                />
                            </div>

                            <input
                                type="text"
                                className="mt-2 w-full rounded-md border border-gray-200 px-3 py-2 text-sm dark:bg-slate-700 dark:border-slate-600"
                                placeholder={`Enter ${brand} card number`}
                                value={cardNumber}
                                onChange={(e) => setCardNumber(e.target.value)}
                            />
                        </div>

                        <div className="mt-4 space-y-3">
                            <button
                                onClick={async () => {
                                    // validate card number
                                    const isMasked = cardNumber.includes('•');
                                    if (!cardNumber || (!isMasked && cardNumber.replace(/\s+/g, '').length < 12)) {
                                        setError('Please enter a valid card number');
                                        return;
                                    }

                                    const payload: ManagePayload = {};
                                    payload.cardType = cardType;
                                    payload.expiry = expiryState;

                                    if (isMasked) {
                                        // user didn't change number: just send last4
                                        payload.cardNumber = String(last4);
                                    } else {
                                        payload.cardNumber = cardNumber.replace(/\s+/g, '');
                                    }

                                    await handleAction('replace', payload);
                                }}
                                disabled={!!loadingAction}
                                className="w-full text-left px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200"
                            >
                                {loadingAction === 'replace' ? 'Saving...' : 'Save changes'}
                            </button>

                            <button
                                onClick={() => handleAction('remove')}
                                disabled={!!loadingAction}
                                className="w-full text-left px-3 py-2 rounded-md bg-red-50 text-red-600 hover:bg-red-100"
                            >
                                {loadingAction === 'remove' ? 'Removing...' : 'Remove card'}
                            </button>
                        </div>

                        {error && <div className="text-sm text-red-600 mt-3">{error}</div>}

                        <div className="mt-5 flex items-center justify-end gap-2">
                            <button
                                onClick={() => setOpen(false)}
                                className="px-3 py-2 text-sm rounded-md bg-gray-100 hover:bg-gray-200"
                            >
                                Close
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </>
    );
}

export default PaymentMethodCard;