import { NextResponse } from 'next/server';
import { generateToken } from '@/app/lib/auth';
import { prisma } from '@/app/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const role = searchParams.get('role') || 'ADMIN';
  const redirect = searchParams.get('redirect') || '/dashboard';

  const email = role === 'ADMIN' ? 'adminRecycleHub@gmail.com' : 'user@recyclehub.com';

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, role: true }
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  const response = NextResponse.redirect(new URL(redirect, request.url));
  response.cookies.set('token', token, {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24,
  });

  return response;
}
