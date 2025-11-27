"use client";

import React, { useEffect, useState, useMemo, useCallback, use } from 'react';
import { apiFetch, v4, demoLocations } from './lib';
import ShopManager from './ShopManager';
import RatingForm from './RatingForm';
import { OrderStatus } from '@/lib/generated/prisma/enums';
import { Order, Shop, User } from '@/lib/generated/prisma/client';

const STATUS_MAP: Record<OrderStatus, { icon: string; label: string; color: string; nextAction: string | null }> = {
    Pending_Pickup: { icon: '📦', label: 'Pending Pickup', color: 'bg-yellow-100 text-yellow-800', nextAction: 'Confirm Pickup' },
    In_Transit_to_Shop: { icon: '🚚', label: 'In Transit to Shop', color: 'bg-blue-100 text-blue-800', nextAction: 'Arrived at Shop' },
    Arrived_at_Shop_Queuing: { icon: '🏭', label: 'Arrived at Shop Queuing', color: 'bg-purple-100 text-purple-800', nextAction: 'Start Washing' },
    Washing: { icon: '🧺', label: 'Washing', color: 'bg-indigo-100 text-indigo-800', nextAction: 'Washing Complete / Start Drying' },
    Washing_Complete_Start_Drying: { icon: '☀️', label: 'Washing Complete Start Drying', color: 'bg-orange-100 text-orange-800', nextAction: 'Drying Complete / Start Packing' },
    Drying_Complete_Start_Packing: { icon: '👔', label: 'Drying Complete Start Packing', color: 'bg-pink-100 text-pink-800', nextAction: 'Out for Delivery' },
    Out_for_Delivery: { icon: '🛵', label: 'Out for Delivery', color: 'bg-teal-100 text-teal-800', nextAction: 'Complete Order' },
    Completed: { icon: '✨', label: 'Completed', color: 'bg-green-100 text-green-800', nextAction: null },
    Cancelled: { icon: '🚫', label: 'Cancelled', color: 'bg-red-100 text-red-800', nextAction: null },
};

export default function AppClient() {
    const userId = useMemo(() => {
        let id = localStorage.getItem('userId');
        if (!id) {
            id = v4();
            localStorage.setItem('userId', id);
        }
        return id;
    }, []);
    const providerId = useMemo(() => {
        let id = localStorage.getItem('providerId');
        if (!id) {
            id = v4();
            localStorage.setItem('providerId', id);
        }
        return id;
    }, []);
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<'user' | 'provider' | null>(null);
    const [shops, setShops] = useState<Shop[]>([]);
    const [userOrders, setUserOrders] = useState<Order[]>([]);
    const [providerOrders, setProviderOrders] = useState<Order[]>([]);
    const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
    const [orderWeight, setOrderWeight] = useState<number>(5);
    const [modalOrder, setModalOrder] = useState<Order | null>(null);

    const getStatusMeta = (s: Order['status']) => {
        return STATUS_MAP[s as OrderStatus];
    };

    // Ensure user exists in DB and load user record
    async function loadUserRecord(id: string) {
        try {
            const u = await apiFetch<User>(`/api/users/${id}`);
            // if the endpoint returns an error object, the generic call will have thrown earlier; treat as valid
            setUser(u);
            return u;
        } catch (err) {
            try {
                const created = await apiFetch<User>('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
                setUser(created);
                return created;
            } catch (e) {
                console.error('loadUserRecord error', e);
                return null;
            }
        }
    }

    async function loadProviderRecord(id: string) {
        try {
            const p = await apiFetch<User>(`/api/users/${id}`);
            // if the endpoint returns an error object, the generic call will have thrown earlier; treat as valid
            setUser(p);
            return p;
        } catch (err) {
            try {
                const created = await apiFetch<User>('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
                setUser(created);
                return created;
            } catch (e) {
                console.error('loadProviderRecord error', e);
                return null;
            }
        }
    }

    const fetchOrders = useCallback(async () => {
        if (!userId) return;
        try {
            const u = await apiFetch<Order[]>(`/api/orders?userId=${userId}`);

            // For provider orders, fetch orders for shops owned by this providerId
            const ownedShopIds = shops.filter((s: Shop) => s.ownerId === providerId).map((s) => s.id);
            let p: Order[] = [];
            for (const id of ownedShopIds) {
                try {
                    const res = await apiFetch<Order[]>(`/api/orders?shopId=${id}`);
                    if (Array.isArray(res)) p = p.concat(res);
                } catch (e) {
                    console.error('fetchOrders (per-shop) error', e);
                }
            }

            setUserOrders(Array.isArray(u) ? u : []);
            setProviderOrders(p);
        } catch (e) {
            console.error('fetchOrders error', e);
            setUserOrders([]);
            setProviderOrders([]);
        }
    }, [userId, providerId, shops]);

    const fetchShops = useCallback(async () => {
        try {
            const s = await apiFetch<Shop[]>('/api/shops');
            setShops(Array.isArray(s) ? s : []);
        } catch (e) {
            console.error('fetchShops error', e);
            setShops([]);
        }
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const s = await apiFetch<Shop[]>('/api/shops');
                setShops(s || []);

                if (userId) {
                    try {
                        const u = await apiFetch<Order[]>(`/api/orders?userId=${userId}`);

                        // build provider orders from shops owned by this providerId
                        const ownedShopIds = (s || []).filter((shop: Shop) => shop.ownerId === providerId).map((sh: Shop) => sh.id);
                        let p: Order[] = [];
                        for (const id of ownedShopIds) {
                            try {
                                const res = await apiFetch<Order[]>(`/api/orders?shopId=${id}`);
                                if (Array.isArray(res)) p = p.concat(res);
                            } catch (err) {
                                console.error('fetch per-shop orders error', err);
                            }
                        }

                        setUserOrders(u || []);
                        setProviderOrders(p);
                    } catch (e) {
                        console.error('fetchOrders error', e);
                        setUserOrders([]);
                        setProviderOrders([]);
                    }
                }
            } catch (e) {
                console.error('fetchShops error', e);
                setShops([]);
            }
        };
        fetchData();

        console.log('userOrders', userOrders, 'providerOrders', providerOrders);

    }, [userId]);

    const filteredShops = useMemo(() => shops, [shops]);

    const placeOrder = async () => {
        if (!selectedShop || !userId) return;
        // Ensure the user exists in the database before creating an order
        await loadUserRecord(userId);
        // Ensure the shop owner (provider user) exists before creating order
        if (selectedShop?.ownerId) await loadUserRecord(selectedShop.ownerId);
        try {
            await apiFetch<Order>('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    shopId: selectedShop.id,
                    providerName: selectedShop.name,
                    details: `Wash & Fold (${orderWeight} kg)`,
                    weightKg: orderWeight,
                    pricePerKg: selectedShop.pricePerKg,
                    pickupAddress: 'User Address (mock)'
                })
            });
            setSelectedShop(null);
            setOrderWeight(5);
            fetchOrders();
            alert('Order placed');
        } catch (e) {
            console.error('placeOrder error', e);
            alert('Failed to place order');
        }
    };

    const advanceOrder = async (orderId: string) => {
        try {
            await apiFetch<Order>('/api/orders', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId, action: 'advance' }) });
            fetchOrders();
        } catch (e) {
            console.error('advanceOrder error', e);
            alert('Failed to advance order');
        }
    };

    const submitRating = async (orderId: string, rating: number, comment: string) => {
        try {
            await apiFetch<Order>('/api/orders', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId, action: 'rate', rating, ratingComment: comment }) });
            setModalOrder(null);
            fetchOrders();
        } catch (e) {
            console.error('submitRating error', e);
            alert('Failed to submit rating');
        }
    };

    if (!userId) return <div className="p-8">Initializing...</div>;

    if (!role) {
        return (
            <div className="min-h-screen flex items-center justify-center p-8 bg-indigo-600 text-white">
                <div className="text-center max-w-sm w-full">
                    <h1 className="text-4xl font-bold mb-4">CleanSwipe</h1>
                    <p className="mb-6">Your Real-Time Laundry Partner (local demo)</p>
                    <button onClick={() => setRole('user')} className="w-full py-3 mb-3 bg-white text-indigo-700 rounded-lg">I Need Laundry Done</button>
                    <button onClick={() => setRole('provider')} className="w-full py-3 bg-indigo-700/90 text-white rounded-lg">I Am A Laundry Provider</button>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen bg-gray-50 font-sans">
            <header className="p-4 bg-white shadow flex justify-between items-center">
                <h2 className="text-xl font-bold text-indigo-600">{role === 'user' ? 'User Dashboard' : 'Provider Portal'}</h2>
                <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-600">ID: {userId.substring(0, 8)}</div>
                    <button onClick={() => setRole(null)} className="text-sm text-red-500">Change Role</button>
                </div>
            </header>
            <main className="p-4">
                {role === 'user' ? (
                    <div>
                        <h3 className="text-2xl font-bold mb-4">Find Nearby Providers</h3>
                        <div className="bg-white p-4 rounded shadow mb-4">
                            <div className="h-36 bg-gray-200 flex items-center justify-center">[Map Simulation - {filteredShops.length} shops]</div>
                            <div className="mt-4 space-y-2">
                                {filteredShops.map((s: Shop) => (
                                    <div key={s.id} className={`p-3 border rounded ${selectedShop?.id === s.id ? 'bg-indigo-50' : 'bg-white'}`} onClick={() => setSelectedShop(s)}>
                                        <div className="flex justify-between items-center">
                                            <div className="font-semibold">{s.name}</div>
                                            <div className="text-sm text-indigo-600">{(s.location as { distance: number | string }).distance || '1.0 mi'}</div>
                                        </div>
                                        <div className="text-sm text-gray-500">{s.address}</div>
                                        <div className="text-yellow-500 text-sm">{s.ratingCount! > 0 ? (s.ratingSum! / s.ratingCount!).toFixed(1) : 'New'} ({s.ratingCount} ratings)</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {selectedShop && (
                            <>
                            <div className='absolute inset-0 bg-black/50 z-10 backdrop-blur-sm'></div>
                            <div className="absolute bottom-0 left-0 right-0 z-20 bg-green-100 p-4 shadow">
                                <h4 className="font-bold">Place Order with {selectedShop.name}</h4>
                                <div className="mt-2 flex items-center gap-2">
                                    <label>Weight (kg)</label>
                                    <input type="number" value={orderWeight} onChange={(e) => setOrderWeight(Number(e.target.value))} className="w-20 p-2 border rounded" />
                                    <div className="font-bold">Total: ${(orderWeight * (selectedShop.pricePerKg || 5)).toFixed(2)}</div>
                                </div>
                                <div className="mt-3 flex gap-2">
                                    <button onClick={() => setSelectedShop(null)} className="flex-1 py-2 bg-red-500 text-white rounded">Cancel</button>
                                    <button onClick={placeOrder} className="flex-1 py-2 bg-green-600 text-white rounded">Request Pickup</button>
                                </div>
                            </div>
                            </>
                        )}

                        <section className="mt-6">
                            <h4 className="text-xl font-bold">Your Active Orders ({userOrders.length})</h4>
                            <div className="mt-3 space-y-3">
                                {userOrders.length === 0 ? <div className="p-4 bg-white rounded">No active orders.</div> : userOrders.filter((o: Order) => o.status !== 'Completed').map((o: Order) => (
                                    <div key={o.id} className="p-4 bg-white rounded shadow">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="font-bold">{o.providerName || 'Unknown'}</div>
                                                <div className="text-sm text-gray-500">{o.details}</div>
                                            </div>
                                            <div className="text-xs">{getStatusMeta(o.status)?.icon} {getStatusMeta(o.status)?.label}</div>
                                        </div>
                                        <div className="mt-2 flex justify-between items-center">
                                            <div className="text-indigo-600 font-semibold">Total: ${(Number(o.pricePerKg || 5) * Number(o.weightKg || 5)).toFixed(2)}</div>
                                            {o.status === 'Completed' && !o.rating && <button onClick={() => setModalOrder(o)} className="px-3 py-1 bg-yellow-500 text-white rounded">Rate</button>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="mt-6">
                            <h4 className="text-xl font-bold">Your Completed Orders</h4>
                            <div className="mt-3 space-y-3">
                                {userOrders.filter((o: Order) => o.status === 'Completed').length === 0 ? <div className="p-4 bg-white rounded">No completed orders.</div> : userOrders.filter((o: Order) => o.status === 'Completed').map((o: Order) => (
                                    <div key={o.id} className="p-4 bg-white rounded shadow">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="font-bold">{o.providerName || 'Unknown'}</div>
                                                <div className="text-sm text-gray-500">{o.details}</div>
                                            </div>
                                            <div className="text-xs">{getStatusMeta(o.status)?.icon} {getStatusMeta(o.status)?.label}</div>
                                        </div>
                                        <div className="mt-2 flex justify-between items-center">
                                            <div className="text-indigo-600 font-semibold">Total: ${(Number(o.pricePerKg || 5) * Number(o.weightKg || 5)).toFixed(2)}</div>
                                            {o.status === 'Completed' && !o.rating && <button onClick={() => setModalOrder(o)} className="px-3 py-1 bg-yellow-500 text-white rounded">Rate</button>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {modalOrder && (
                            <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
                                <div className="bg-white p-4 rounded max-w-md w-full">
                                    <h4 className="font-bold">Rate {modalOrder.providerName}</h4>
                                    <RatingForm order={modalOrder} onSubmit={(r, c) => submitRating(modalOrder.id, r, c)} onCancel={() => setModalOrder(null)} />
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div>
                        <h3 className="text-2xl font-bold mb-4">Provider Portal</h3>
                        <div className="mb-4">
                            <ShopManager ownerId={providerId} onSaved={() => fetchShops()} />
                        </div>

                        <section className="mb-6">
                            <h4 className="text-xl font-bold">Pickup Requests</h4>
                            <div className="mt-3 space-y-3">
                                {providerOrders.filter((o) => o.status === 'Pending_Pickup').length === 0 ? (
                                    <div className="p-4 bg-white rounded">No pickup requests.</div>
                                ) : (
                                    providerOrders.filter((o) => o.status === 'Pending_Pickup').map((o) => (
                                        <div key={o.id} className="p-4 bg-white rounded shadow">
                                            <div className="flex justify-between">
                                                <div>User: {o.userId.substring(0, 8)}</div>
                                                <div className="text-xs">{getStatusMeta(o.status)?.icon} {getStatusMeta(o.status)?.label}</div>
                                            </div>
                                            <div className="mt-2 flex justify-between items-center">
                                                <div className="text-xs text-gray-600">{o.details} @ {o.pickupAddress}</div>
                                                <div className="flex gap-2">
                                                    <button onClick={() => advanceOrder(o.id)} className="px-3 py-1 bg-indigo-600 text-white rounded">{STATUS_MAP['In_Transit_to_Shop'].nextAction}</button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>

                        <section className="mb-6">
                            <h4 className="text-xl font-bold">Active Orders</h4>
                            <div className="mt-3 space-y-3">
                                {providerOrders.filter((o) => o.status !== 'Pending_Pickup' && o.status !== 'Completed').length === 0 ? (
                                    <div className="p-4 bg-white rounded">No active orders.</div>
                                ) : (
                                    providerOrders.filter((o) => o.status !== 'Pending_Pickup' && o.status !== 'Completed').map((o) => (
                                        <div key={o.id} className="p-4 bg-white rounded shadow">
                                            <div className="flex justify-between">
                                                <div>Order: {o.id.substring(0, 8)}</div>
                                                <div className='text-xs'>{getStatusMeta(o.status)?.icon} {getStatusMeta(o.status)?.label}</div>
                                            </div>
                                            <div className="mt-2 flex justify-between">
                                                <div className="text-xs text-gray-600">{o.details}</div>
                                                <button onClick={() => advanceOrder(o.id)} className="px-3 py-1 bg-indigo-600 text-white rounded">Next</button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>

                        <section className="mb-6">
                            <h4 className="text-xl font-bold">Completed Orders</h4>
                            <div className="mt-3 space-y-3">
                                {providerOrders.filter((o) => o.status === 'Completed').length === 0 ? (
                                    <div className="p-4 bg-white rounded">No completed orders.</div>
                                ) : (
                                    providerOrders.filter((o) => o.status === 'Completed').map((o) => (
                                        <div key={o.id} className="p-4 bg-white rounded shadow">
                                            <div className="flex justify-between">
                                                <div>Order: {o.id.substring(0, 8)}</div>
                                                <div className='text-xs'>{getStatusMeta(o.status)?.icon} {getStatusMeta(o.status)?.label}</div>
                                            </div>
                                            <div className="mt-2 flex justify-between">
                                                <div className="text-xs text-gray-600">{o.details}</div>
                                                <div className="text-sm text-yellow-500">{o.rating ? `Rating: ${o.rating} ★` : 'No rating'}</div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>
                    </div>
                )}
            </main>
        </div>
    );
}