import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { requireAuth } from '@/app/lib/auth';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth('ADMIN');
    const { id } = await params;
    const body = await request.json();
    const { status, tipePembayaran, metodePembayaran, statusPembayaran, tanggalJatuhTempo, buktiPembayaran, catatan } = body;

    if (!['PENDING', 'DIPROSES', 'SELESAI', 'BATAL'].includes(status)) {
      return NextResponse.json(
        { error: 'Status tidak valid' },
        { status: 400 }
      );
    }

    const redeem = await prisma.redeem.findUnique({
      where: { id },
      include: { reward: true },
    });

    if (!redeem) {
      return NextResponse.json(
        { error: 'Penukaran tidak ditemukan' },
        { status: 404 }
      );
    }

    const updateData: any = { status };

    if (tipePembayaran) updateData.tipePembayaran = tipePembayaran;
    if (metodePembayaran) updateData.metodePembayaran = metodePembayaran;
    if (statusPembayaran) updateData.statusPembayaran = statusPembayaran;
    if (tanggalJatuhTempo) updateData.tanggalJatuhTempo = new Date(tanggalJatuhTempo);
    if (buktiPembayaran !== undefined) updateData.buktiPembayaran = buktiPembayaran;
    if (catatan !== undefined) updateData.catatan = catatan;

    const updated = await prisma.redeem.update({
      where: { id },
      data: updateData,
      include: {
        reward: true,
        user: { select: { id: true, nama: true, email: true } },
      },
    });

    if (status === 'BATAL') {
      await prisma.$transaction([
        prisma.poin.update({
          where: { userId: redeem.userId },
          data: { jumlahPoin: { increment: redeem.poinDigunakan } },
        }),
        prisma.reward.update({
          where: { id: redeem.rewardId },
          data: { stok: { increment: 1 } },
        }),
      ]);
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Update redeem error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}
