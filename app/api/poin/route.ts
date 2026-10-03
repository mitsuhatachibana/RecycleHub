import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { requireAuth } from '@/app/lib/auth';

export async function GET() {
  try {
    const session = await requireAuth();
    const poin = await prisma.poin.findUnique({
      where: { userId: session.id },
    });

    if (!poin) {
      return NextResponse.json({ jumlahPoin: 0, totalPoinDikumpulkan: 0 });
    }

    return NextResponse.json(poin);
  } catch (error) {
    console.error('Get poin error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}
