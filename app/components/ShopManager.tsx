import React, { useEffect, useState } from 'react';
import { apiFetch, demoLocations, v4 } from './lib';
import { Shop } from '@/lib/generated/prisma/client';

type Props = {
  ownerId: string;
  onSaved: () => void;
};

export default function ShopManager({ ownerId, onSaved }: Props) {
  const [shop, setShop] = useState<Shop | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const shops = await apiFetch<Shop[]>('/api/shops');
        const mine = shops.find((s) => s.ownerId === ownerId);
        if (mine) {
          setShop(mine);
        } else {
          setShop({ id: v4(), ownerId, name: '', address: '', description: '', pricePerKg: 5, ratingSum: 0, ratingCount: 0, location: null, createdAt: new Date(), updatedAt: new Date() });
        }
      } catch (e) {
        console.error('ShopManager load error', e);
        setShop({ id: v4(), ownerId, name: '', address: '', description: '', pricePerKg: 5, ratingSum: 0, ratingCount: 0, location: null, createdAt: new Date(), updatedAt: new Date() });
      }
    })();
  }, [ownerId]);

  const save = async () => {
    setIsLoading(true);
    try {
      await apiFetch('/api/shops', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...(shop as Shop), location: demoLocations[Math.floor(Math.random() * demoLocations.length)] }) });
      onSaved();
      alert('Shop saved');
    } catch (e) {
      console.error('ShopManager save error', e);
      alert('Failed to save shop');
    } finally {
      setIsLoading(false);
    }
  };

  if (!shop) return <div>Loading shop...</div>;

  return (
    <div className="p-4 bg-white rounded shadow">
      <div className="mb-2">Shop Name</div>
      <input value={shop.name} onChange={(e) => setShop({ ...(shop as Shop), name: e.target.value })} className="w-full p-2 border rounded mb-2" />
      <div className="mb-2">Address</div>
      <input value={shop.address} onChange={(e) => setShop({ ...(shop as Shop), address: e.target.value })} className="w-full p-2 border rounded mb-2" />
      <div className="mb-2">Price per Kg</div>
      <input
        type="number"
        value={shop.pricePerKg ?? ''}
        onChange={(e) => setShop({ ...(shop as Shop), pricePerKg: e.target.value === '' ? 0 : Number(e.target.value) })}
        className="w-32 p-2 border rounded mb-2"
      />
      <div className="flex gap-2">
        <button onClick={save} disabled={isLoading} className="px-4 py-2 bg-indigo-600 text-white rounded">{isLoading ? 'Saving...' : 'Save Shop'}</button>
      </div>
    </div>
  );
}
