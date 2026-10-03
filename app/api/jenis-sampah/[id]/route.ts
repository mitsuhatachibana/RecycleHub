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
    const jenisSampah = await prisma.jenisSampah.findUnique({
      where: { id },
      include: {
        _count: { select: { LaporanSampah: true } },
      },
    });

    if (!jenisSampah) {
      return NextResponse.json(
        { error: 'Jenis sampah tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json(jenisSampah);
  } catch (error) {
    console.error('Get jenis sampah error:', error);
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
    const { namaJenis, deskripsi, hargaPerKg } = await request.json();
    const { id } = await params;

    if (!namaJenis) {
      return NextResponse.json(
        { error: 'Nama jenis sampah harus diisi' },
        { status: 400 }
      );
    }

    const jenisSampah = await prisma.jenisSampah.update({
      where: { id },
      data: {
        namaJenis,
        deskripsi,
        hargaPerKg: hargaPerKg || 0,
      },
    });

    return NextResponse.json(jenisSampah);
  } catch (error) {
    console.error('Update jenis sampah error:', error);
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

    const jenisSampah = await prisma.jenisSampah.findUnique({
      where: { id },
    });

    if (!jenisSampah) {
      return NextResponse.json(
        { error: 'Jenis sampah tidak ditemukan' },
        { status: 404 }
      );
    }

    await prisma.jenisSampah.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Jenis sampah berhasil dihapus' });
  } catch (error) {
    console.error('Delete jenis sampah error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}