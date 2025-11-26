import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

// POST /api/users  -> create or upsert a user
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, role, username, email, password } = body;
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    // If a user exists, update role. If not, create with required fields.
    const existing = await prisma.user.findUnique({ where: { id } });
    let user;

    if (existing) {
      user = await prisma.user.update({
        where: { id },
        data: { role: role || 'USER' },
      });
    } else {
      // Provide required fields for Prisma's UserCreateInput.
      // Prefer values supplied in the request body; otherwise synthesize safe placeholders.
      const newUsername = username || `user_${id.slice(0, 8)}`;
      const newEmail = email || `${id}@no-reply.local`;
      const newPassword = typeof password === 'string' ? password : '';

      user = await prisma.user.create({
        data: {
          id,
          role: role || 'USER',
          username: newUsername,
          email: newEmail,
          password: newPassword,
        },
      });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('POST /api/users error', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
