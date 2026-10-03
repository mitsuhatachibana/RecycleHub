import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { requireAuth } from '@/app/lib/auth';

export async function GET() {
  try {
    const session = await requireAuth();

    if (session.role === 'ADMIN') {
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

      const totalBerat = await prisma.laporanSampah.aggregate({
        _sum: { berat: true },
        where: {
          status: {
            not: 'DITOLAK',
          },
        },
      });

      return NextResponse.json({
        totalUsers,
        totalLaporan,
        totalWilayah,
        totalJenisSampah,
        totalTransaksi,
        totalBerat: totalBerat._sum.berat || 0,
        laporanMenunggu: statusCount.MENUNGGU,
        laporanDiproses: statusCount.DIPROSES,
        laporanSelesai: statusCount.SELESAI,
        laporanDitolak: statusCount.DITOLAK,
        userLaporanCount: 0,
        userBeratTotal: 0,
        laporanTerbaru,
        jenisSampahPopuler,
        totalPendapatan: totalPendapatan._sum.totalHarga || 0,
      });
    }

    const [
      userLaporanCount,
      userBeratTotal,
      laporanMenunggu,
      laporanDiproses,
      laporanSelesai,
      laporanDitolak,
      laporanTerbaru,
      jenisSampahPopuler,
    ] = await Promise.all([
      prisma.laporanSampah.count({
        where: { userId: session.id },
      }),
      prisma.laporanSampah.aggregate({
        _sum: { berat: true },
        where: { userId: session.id, status: { not: 'DITOLAK' } },
      }),
      prisma.laporanSampah.count({
        where: { userId: session.id, status: 'MENUNGGU' },
      }),
      prisma.laporanSampah.count({
        where: { userId: session.id, status: 'DIPROSES' },
      }),
      prisma.laporanSampah.count({
        where: { userId: session.id, status: 'SELESAI' },
      }),
      prisma.laporanSampah.count({
        where: { userId: session.id, status: 'DITOLAK' },
      }),
      prisma.laporanSampah.findMany({
        where: { userId: session.id },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          jenisSampah: { select: { id: true, namaJenis: true } },
          wilayah: { select: { id: true, namaWilayah: true } },
        },
      }),
      prisma.jenisSampah.findMany({
        take: 5,
        orderBy: { LaporanSampah: { _count: 'desc' } },
        include: { _count: { select: { LaporanSampah: true } } },
      }),
    ]);

    return NextResponse.json({
      totalUsers: 0,
      totalLaporan: userLaporanCount,
      totalWilayah: 0,
      totalJenisSampah: 0,
      totalTransaksi: 0,
      totalBerat: userBeratTotal._sum.berat || 0,
      laporanMenunggu,
      laporanDiproses,
      laporanSelesai,
      laporanDitolak,
      userLaporanCount,
      userBeratTotal: userBeratTotal._sum.berat || 0,
      laporanTerbaru,
      jenisSampahPopuler,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}