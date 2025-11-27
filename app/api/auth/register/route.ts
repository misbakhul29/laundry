import { Role } from '@/lib/generated/prisma/enums';
import prisma from '@/lib/prisma';
import bcrypt from "bcrypt";

export async function POST(req: Request) {
    const { email, password, confirmPassword, role } = await req.json();
    if (password !== confirmPassword) {
        return Response.json({ error: 'Passwords do not match' }, { status: 400 });
    }
    if (password.length < 6) {
        return Response.json({ error: 'Password must be at least 6 characters long' }, { status: 400 });
    }
    if (!email || !password || !confirmPassword) {
        return Response.json({ error: 'Email, password, and confirm password are required' }, { status: 400 });
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
        return Response.json({ error: 'Invalid email format' }, { status: 400 });
    }
    if (password.toLowerCase().includes(email.split('@')[0].toLowerCase())) {
        return Response.json({ error: 'Password should not contain parts of the email' }, { status: 400 });
    }
    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password) || !/[\W_]/.test(password)) {
        return Response.json({ error: 'Password must include uppercase, lowercase, number, and special character' }, { status: 400 });
    }
    if (/\s/.test(password)) {
        return Response.json({ error: 'Password should not contain spaces' }, { status: 400 });
    }
    if (/(.)\1\1/.test(password)) {
        return Response.json({ error: 'Password should not contain sequences of three or more repeated characters' }, { status: 400 });
    }
    if (password.toLowerCase() === 'password' || password.toLowerCase() === '123456' || password.toLowerCase() === 'qwerty') {
        return Response.json({ error: 'Password is too common' }, { status: 400 });
    }
    const query = prisma.user.findUnique({ where: { email } });
    const existingUser = await query;
    if (existingUser) {
        return Response.json({ error: 'Email already registered' }, { status: 400 });
    }

    if (role !== Role.USER && role !== Role.PROVIDER) {
        return Response.json({ error: 'Invalid role specified' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    if (!hashedPassword) {
        return Response.json({ error: 'Failed to hash password' }, { status: 500 });
    }

    const newUser = await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            username: email.split('@')[0],
            role: role === Role.USER ? Role.USER : Role.PROVIDER,
        },
    });
    return Response.json({ message: 'User registered successfully', user: newUser });
}