import { NextResponse } from 'next/server';
import { prisma, Prisma } from '@/app/lib/prisma';
import { requireAuth } from '@/app/lib/auth';
import { StatusLaporan } from '@/app/generated/prisma/enums';

export async function GET(request: Request) {
  try {
    const session = await requireAuth('ADMIN');
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const sort = searchParams.get('sort') || 'newest';

    const skip = (page - 1) * limit;

    const where: Prisma.LaporanSampahWhereInput = {};

    if (search) {
      where.OR = [
        { deskripsi: { contains: search, mode: 'insensitive' } },
        { user: { nama: { contains: search, mode: 'insensitive' } },
        },
        { jenisSampah: { namaJenis: { contains: search, mode: 'insensitive' } },
        },
        { wilayah: { namaWilayah: { contains: search, mode: 'insensitive' } },
        },
      ];
    }

    if (status) {
      where.status = status as StatusLaporan;
    }

    const orderBy: Prisma.LaporanSampahOrderByWithRelationInput = {};
    if (sort === 'oldest') {
      orderBy.createdAt = 'asc';
    } else if (sort === 'berat_asc') {
      orderBy.berat = 'asc';
    } else if (sort === 'berat_desc') {
      orderBy.berat = 'desc';
    } else {
      orderBy.createdAt = 'desc';
    }

    const [laporan, total, stats] = await Promise.all([
      prisma.laporanSampah.findMany({
        where,
        include: {
          user: { select: { id: true, nama: true, email: true, noHp: true } },
          jenisSampah: { select: { id: true, namaJenis: true, hargaPerKg: true } },
          wilayah: { select: { id: true, namaWilayah: true } },
          FotoSampah: true,
          Transaksi: { select: { id: true, totalHarga: true, status: true } },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.laporanSampah.count({ where }),
      prisma.laporanSampah.aggregate({
        _count: { id: true },
        _sum: { berat: true },
        where: {
          ...where,
          status: {
            not: 'DITOLAK',
          },
        },
      }),
    ]);

    const statusCount = await prisma.laporanSampah.groupBy({
      by: ['status'],
      _count: true,
      where,
    });

    const menunggu = statusCount.find((s: { status: string; _count: number }) => s.status === 'MENUNGGU')?._count || 0;
    const diproses = statusCount.find((s: { status: string; _count: number }) => s.status === 'DIPROSES')?._count || 0;
    const selesai = statusCount.find((s: { status: string; _count: number }) => s.status === 'SELESAI')?._count || 0;
    const ditolak = statusCount.find((s: { status: string; _count: number }) => s.status === 'DITOLAK')?._count || 0;

    return NextResponse.json({
      data: laporan,
      totalPages: Math.ceil(total / limit),
      total,
      stats: {
        total,
        menunggu,
        diproses,
        selesai,
        ditolak,
        totalBerat: stats._sum.berat || 0,
      },
    });
  } catch (error) {
    console.error('Admin laporan error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}