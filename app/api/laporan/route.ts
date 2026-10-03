import { NextResponse } from 'next/server';
import { prisma, Prisma } from '@/app/lib/prisma';
import { requireAuth } from '@/app/lib/auth';
import { StatusLaporan } from '@/app/generated/prisma/enums';

// GET laporan (filter by role)
export async function GET(request: Request) {
  try {
    const session = await requireAuth();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where: Prisma.LaporanSampahWhereInput = {};

    if (session.role === 'USER') {
      where.userId = session.id;
    }

    if (status) {
      where.status = status as StatusLaporan;
    }

    const laporan = await prisma.laporanSampah.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            nama: true,
            email: true,
          },
        },
        jenisSampah: {
          select: {
            id: true,
            namaJenis: true,
            hargaPerKg: true,
          },
        },
        wilayah: {
          select: {
            id: true,
            namaWilayah: true,
          },
        },
        FotoSampah: true,
        Transaksi: {
          select: {
            totalHarga: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(laporan);
  } catch (error) {
    console.error('Get laporan error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}

// POST laporan
export async function POST(request: Request) {
  try {
    const session = await requireAuth();
    const { jenisSampahId, wilayahId, berat, deskripsi } = await request.json();

    if (!jenisSampahId || !wilayahId || !berat) {
      return NextResponse.json(
        { error: 'Jenis sampah, wilayah, dan berat harus diisi' },
        { status: 400 }
      );
    }

    const laporan = await prisma.laporanSampah.create({
      data: {
        userId: session.id,
        jenisSampahId,
        wilayahId,
        berat: parseFloat(berat),
        deskripsi,
        status: 'MENUNGGU',
      },
      include: {
        user: {
          select: {
            id: true,
            nama: true,
          },
        },
        jenisSampah: true,
        wilayah: true,
      },
    });

    return NextResponse.json(laporan, { status: 201 });
  } catch (error) {
    console.error('Create laporan error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}