import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { requireAuth } from '@/app/lib/auth';

// GET semua jenis sampah
export async function GET() {
  try {
    const jenisSampah = await prisma.jenisSampah.findMany({
      include: {
        _count: {
          select: {
            LaporanSampah: true,
          },
        },
      },
      orderBy: {
        namaJenis: 'asc',
      },
    });

    return NextResponse.json(jenisSampah);
  } catch (error) {
    console.error('Get jenis sampah error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}

// POST jenis sampah (Admin only)
export async function POST(request: Request) {
  try {
    await requireAuth('ADMIN');
    const { namaJenis, deskripsi, hargaPerKg } = await request.json();

    if (!namaJenis) {
      return NextResponse.json(
        { error: 'Nama jenis sampah harus diisi' },
        { status: 400 }
      );
    }

    const jenis = await prisma.jenisSampah.create({
      data: {
        namaJenis,
        deskripsi,
        hargaPerKg: hargaPerKg || 0,
      },
    });

    return NextResponse.json(jenis, { status: 201 });
  } catch (error) {
    if (error instanceof Error && (error as { code?: string }).code === 'P2002') {
      return NextResponse.json(
        { error: 'Nama jenis sampah sudah ada' },
        { status: 400 }
      );
    }
    console.error('Create jenis sampah error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}