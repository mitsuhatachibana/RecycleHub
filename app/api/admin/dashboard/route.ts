import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { requireAuth } from '@/app/lib/auth';

export async function GET() {
  try {
    await requireAuth('ADMIN');

    const [
      totalUsers,
      totalLaporan,
      totalWilayah,
      totalJenisSampah,
      totalTransaksi,
      laporanStatus,
      laporanTerbaru,
      jenisSampahPopuler,
      totalPendapatan,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.laporanSampah.count(),
      prisma.wilayah.count(),
      prisma.jenisSampah.count(),
      prisma.transaksi.count(),
      prisma.laporanSampah.groupBy({
        by: ['status'],
        _count: true,
      }),
      prisma.laporanSampah.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, nama: true } },
          jenisSampah: { select: { id: true, namaJenis: true } },
          wilayah: { select: { id: true, namaWilayah: true } },
        },
      }),
      prisma.jenisSampah.findMany({
        take: 5,
        orderBy: { LaporanSampah: { _count: 'desc' } },
        include: { _count: { select: { LaporanSampah: true } } },
      }),
      prisma.transaksi.aggregate({
        _sum: { totalHarga: true },
        where: { status: 'SELESAI' },
      }),
    ]);

    const statusCount = {
      MENUNGGU: 0,
      DIPROSES: 0,
      SELESAI: 0,
      DITOLAK: 0,
    };

    laporanStatus.forEach((item: { status: keyof typeof statusCount; _count: number }) => {
      statusCount[item.status] = item._count;
    });

    return NextResponse.json({
      totalUsers,
      totalLaporan,
      totalWilayah,
      totalJenisSampah,
      totalTransaksi,
      totalPendapatan: totalPendapatan._sum.totalHarga || 0,
      laporanStatus: statusCount,
      laporanTerbaru,
      jenisSampahPopuler,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}