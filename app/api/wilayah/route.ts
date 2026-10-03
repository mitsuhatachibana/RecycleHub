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

    const where: Prisma.WilayahWhereInput = {};

    if (search) {
      where.namaWilayah = { contains: search, mode: 'insensitive' };
    }

    const orderBy: Prisma.WilayahOrderByWithRelationInput = {};
    if (sort === 'oldest') {
      orderBy.createdAt = 'asc';
    } else {
      orderBy.createdAt = 'desc';
    }

    const [wilayah, total] = await Promise.all([
      prisma.wilayah.findMany({
        where,
        include: {
          _count: { select: { LaporanSampah: true } },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.wilayah.count({ where }),
    ]);

    return NextResponse.json({
      data: wilayah,
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    console.error('Get wilayah error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await requireAuth('ADMIN');
    const { namaWilayah, kodePos } = await request.json();

    if (!namaWilayah) {
      return NextResponse.json(
        { error: 'Nama wilayah harus diisi' },
        { status: 400 }
      );
    }

    const wilayah = await prisma.wilayah.create({
      data: {
        namaWilayah,
        kodePos: kodePos || null,
      },
    });

    return NextResponse.json(wilayah, { status: 201 });
  } catch (error) {
    console.error('Create wilayah error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}