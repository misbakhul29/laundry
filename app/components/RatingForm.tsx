import type { Order } from '@prisma/client';
import React, { useState } from 'react';

type Props = {
  order: Order;
  onSubmit: (rating: number, comment: string) => void;
  onCancel: () => void;
};

export default function RatingForm({ order, onSubmit, onCancel }: Props) {
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');

  return (
    <div>
      <p className="mb-2">Rate service for order {order.id.substring(0, 8)}</p>
      <div className="flex items-center gap-2 mb-3">
        {[1, 2, 3, 4, 5].map((s) => (
          <button key={s} onClick={() => setRating(s)} className={`${s <= rating ? 'text-yellow-400' : 'text-gray-300'} text-2xl`}>
            ★
          </button>
        ))}
      </div>
      <textarea value={comment} onChange={(e) => setComment(e.target.value)} className="w-full p-2 border rounded mb-3" placeholder="Comments (optional)" />
      <div className="flex gap-2">
        <button onClick={() => onCancel()} className="flex-1 py-2 bg-gray-200 rounded">Cancel</button>
        <button onClick={() => onSubmit(rating, comment)} className="flex-1 py-2 bg-indigo-600 text-white rounded">Submit</button>
      </div>
    </div>
  );
}
