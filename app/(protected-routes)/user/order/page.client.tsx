'use client';

import { PageHeader } from '../components/ui/PageHeader';
import { IconWashHand } from '@tabler/icons-react';
import { useMemo, useState } from 'react';

type Laundry = {
    id: string;
    name: string;
    distanceKm: number;
    priceFrom: number;
    rating: number;
    promo?: string;
    open: boolean;
};

export default function OrderClientPage() {
    const [tab, setTab] = useState<'nearby' | 'promo'>('nearby');

    const data: Laundry[] = useMemo(() => [
        { id: '1', name: 'Fresh & Clean', distanceKm: 0.4, priceFrom: 10, rating: 4.8, promo: '10% off', open: true },
        { id: '2', name: 'QuickWash', distanceKm: 1.2, priceFrom: 8, rating: 4.5, open: true },
        { id: '3', name: 'Spark Laundry', distanceKm: 2.1, priceFrom: 12, rating: 4.9, promo: 'Free pickup', open: false },
        { id: '4', name: 'WashHub', distanceKm: 0.9, priceFrom: 9, rating: 4.3, open: true },
        { id: '5', name: 'Eco Laundry', distanceKm: 3.0, priceFrom: 11, rating: 4.6, promo: '5% off', open: true },
    ], []);

    const filtered = useMemo(() => {
        if (tab === 'promo') return data.filter((d) => d.promo);
        return [...data].sort((a, b) => a.distanceKm - b.distanceKm);
    }, [tab, data]);

    return (
        <div className="flex-1 flex flex-col gap-4 p-4 w-full max-w-md mx-auto select-none">
            <PageHeader title="Order" description="Find laundry services near you" icon={IconWashHand} />

            {/* Map placeholder - mobile first (small height) */}
            <div className="w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 h-48 flex items-center justify-center border border-gray-200">
                <div className="text-sm text-gray-500">Map placeholder (dummy)</div>
            </div>

            {/* Submenu */}
            <div className="flex gap-3 overflow-x-auto py-1">
                <button
                    onClick={() => setTab('nearby')}
                    className={`px-3 py-2 rounded-lg text-sm ${tab === 'nearby' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-800 text-gray-700'}`}>
                    Nearby
                </button>
                <button
                    onClick={() => setTab('promo')}
                    className={`px-3 py-2 rounded-lg text-sm ${tab === 'promo' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-800 text-gray-700'}`}>
                    Promo
                </button>
            </div>

            {/* Nearby list */}
            <div className="space-y-3">
                {filtered.map((shop) => (
                    <div key={shop.id} className="flex items-center justify-between bg-white dark:bg-slate-800 p-3 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-start gap-3">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${shop.open ? 'bg-green-50' : 'bg-red-50'}`}>
                                <span className="text-sm font-semibold">{shop.name.split(' ').map(s=>s[0]).slice(0,2).join('')}</span>
                            </div>
                            <div>
                                <div className="text-sm font-medium">{shop.name}</div>
                                <div className="text-xs text-gray-500">{shop.distanceKm} km · From ${shop.priceFrom}</div>
                                {shop.promo && <div className="text-xs text-indigo-600 mt-1">{shop.promo}</div>}
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-1">
                            <div className="text-sm font-medium">{shop.rating} ★</div>
                            <div className={`text-xs ${shop.open ? 'text-green-600' : 'text-red-600'}`}>{shop.open ? 'Open' : 'Closed'}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}