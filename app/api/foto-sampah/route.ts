import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { requireAuth } from '@/app/lib/auth';

export async function GET(request: Request) {
  try {
    await requireAuth();
    const fotoSampah = await prisma.fotoSampah.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        laporan: {
          select: {
            id: true,
            berat: true,
            user: { select: { id: true, nama: true } },
          },
        },
      },
    });

    return NextResponse.json(fotoSampah);
  } catch (error) {
    console.error('Get foto sampah error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}