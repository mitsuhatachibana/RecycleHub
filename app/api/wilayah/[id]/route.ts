import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { requireAuth } from '@/app/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;
    const wilayah = await prisma.wilayah.findUnique({
      where: { id },
      include: {
        _count: { select: { LaporanSampah: true } },
      },
    });

    if (!wilayah) {
      return NextResponse.json(
        { error: 'Wilayah tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json(wilayah);
  } catch (error) {
    console.error('Get wilayah error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth('ADMIN');
    const { namaWilayah, kodePos } = await request.json();
    const { id } = await params;

    if (!namaWilayah) {
      return NextResponse.json(
        { error: 'Nama wilayah harus diisi' },
        { status: 400 }
      );
    }

    const wilayah = await prisma.wilayah.update({
      where: { id },
      data: {
        namaWilayah,
        kodePos: kodePos || null,
      },
    });

    return NextResponse.json(wilayah);
  } catch (error) {
    console.error('Update wilayah error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth('ADMIN');
    const { id } = await params;

    const wilayah = await prisma.wilayah.findUnique({
      where: { id },
    });

    if (!wilayah) {
      return NextResponse.json(
        { error: 'Wilayah tidak ditemukan' },
        { status: 404 }
      );
    }

    await prisma.wilayah.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Wilayah berhasil dihapus' });
  } catch (error) {
    console.error('Delete wilayah error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}