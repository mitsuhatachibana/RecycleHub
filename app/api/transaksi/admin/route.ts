import { NextResponse } from 'next/server';
import { prisma, Prisma } from '@/app/lib/prisma';
import { requireAuth } from '@/app/lib/auth';
import type { StatusTransaksi } from '@/app/generated/prisma/enums';

export async function GET(request: Request) {
  try {
    const session = await requireAuth('ADMIN');
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const sort = searchParams.get('sort') || 'newest';
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';

    const skip = (page - 1) * limit;

    const where: Prisma.TransaksiWhereInput = {};

    if (search) {
      where.OR = [
        { laporan: { user: { nama: { contains: search, mode: 'insensitive' } } },
        },
        { laporan: { jenisSampah: { namaJenis: { contains: search, mode: 'insensitive' } } },
        },
      ];
    }

    if (status) {
      where.status = status as StatusTransaksi;
    }

    if (startDate && endDate) {
      where.tanggalTransaksi = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const orderBy: Prisma.TransaksiOrderByWithRelationInput = {};
    if (sort === 'oldest') {
      orderBy.tanggalTransaksi = 'asc';
    } else if (sort === 'totalHarga_asc' || sort === 'lowest') {
      orderBy.totalHarga = 'asc';
    } else if (sort === 'totalHarga_desc' || sort === 'highest') {
      orderBy.totalHarga = 'desc';
    } else {
      orderBy.tanggalTransaksi = 'desc';
    }

    const [transaksi, total, stats] = await Promise.all([
      prisma.transaksi.findMany({
        where,
        include: {
          user: { select: { id: true, nama: true, email: true, noHp: true } },
          laporan: {
            select: {
              id: true,
              berat: true,
              deskripsi: true,
              user: { select: { id: true, nama: true, email: true } },
              jenisSampah: { select: { id: true, namaJenis: true, hargaPerKg: true } },
              wilayah: { select: { id: true, namaWilayah: true } },
              FotoSampah: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.transaksi.count({ where }),
      prisma.transaksi.aggregate({
        _count: { id: true },
        _sum: { totalHarga: true },
        where,
      }),
    ]);

    const statusCount = await prisma.transaksi.groupBy({
      by: ['status'],
      _count: true,
      where,
    });

    const selesai = statusCount.find((s: { status: string; _count: number }) => s.status === 'SELESAI')?._count || 0;
    const pending = statusCount.find((s: { status: string; _count: number }) => s.status === 'PENDING')?._count || 0;
    const batal = statusCount.find((s: { status: string; _count: number }) => s.status === 'BATAL')?._count || 0;

    return NextResponse.json({
      data: transaksi,
      totalPages: Math.ceil(total / limit),
      total,
      stats: {
        total,
        totalPendapatan: stats._sum.totalHarga || 0,
        selesai,
        pending,
        batal,
        rataRata: total > 0 ? Math.round((stats._sum.totalHarga || 0) / total) : 0,
      },
    });
  } catch (error) {
    console.error('Admin transaksi error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}