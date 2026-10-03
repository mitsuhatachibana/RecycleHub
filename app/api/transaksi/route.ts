import { NextResponse } from 'next/server';
import { prisma, Prisma } from '@/app/lib/prisma';
import { requireAuth } from '@/app/lib/auth';

export async function GET(request: Request) {
  try {
    await requireAuth();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const sort = searchParams.get('sort') || 'newest';

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

    const orderBy: Prisma.TransaksiOrderByWithRelationInput = {};
    if (sort === 'oldest') {
      orderBy.tanggalTransaksi = 'asc';
    } else if (sort === 'totalHarga_asc') {
      orderBy.totalHarga = 'asc';
    } else if (sort === 'totalHarga_desc') {
      orderBy.totalHarga = 'desc';
    } else {
      orderBy.tanggalTransaksi = 'desc';
    }

    const [transaksi, total] = await Promise.all([
      prisma.transaksi.findMany({
        where,
        include: {
          laporan: {
            select: {
              id: true,
              berat: true,
              user: { select: { id: true, nama: true, email: true } },
              jenisSampah: { select: { id: true, namaJenis: true, hargaPerKg: true } },
              FotoSampah: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.transaksi.count({ where }),
    ]);

    return NextResponse.json({
      data: transaksi,
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    console.error('Get transaksi error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAuth();
    const { laporanId, totalHarga, tanggalTransaksi } = await request.json();

    if (!laporanId || !totalHarga) {
      return NextResponse.json(
        { error: 'Laporan ID dan total harga harus diisi' },
        { status: 400 }
      );
    }
    
    const transaksi = await prisma.transaksi.create({
      data: {
        userId: session.id,
        laporanId,
        totalHarga: parseFloat(totalHarga),
        tanggalTransaksi: tanggalTransaksi ? new Date(tanggalTransaksi) : undefined,
        status: 'PENDING',
      },
      include: {
        laporan: {
          select: {
            id: true,
            berat: true,
            user: { select: { id: true, nama: true } },
            jenisSampah: { select: { id: true, namaJenis: true, hargaPerKg: true } },
            FotoSampah: true,
          },
        },
      },
    });

    const poinDidapat = Math.max(1, Math.floor(parseFloat(totalHarga) / 1000));
    await prisma.poin.upsert({
      where: { userId: session.id },
      update: {
        jumlahPoin: { increment: poinDidapat },
        totalPoinDikumpulkan: { increment: poinDidapat },
      },
      create: {
        userId: session.id,
        jumlahPoin: poinDidapat,
        totalPoinDikumpulkan: poinDidapat,
      },
    });

    return NextResponse.json({ ...transaksi, poinDidapat }, { status: 201 });
  } catch (error) {
    console.error('Create transaksi error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}