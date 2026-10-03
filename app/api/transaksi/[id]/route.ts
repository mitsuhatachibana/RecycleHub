import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { requireAuth } from '@/app/lib/auth';
import type { StatusTransaksi } from '@/app/generated/prisma/enums';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;
    const transaksi = await prisma.transaksi.findUnique({
      where: { id },
      include: {
        laporan: {
          select: {
            id: true,
            berat: true,
            status: true,
            user: { select: { id: true, nama: true, email: true } },
            jenisSampah: { select: { id: true, namaJenis: true, hargaPerKg: true } },
            wilayah: { select: { id: true, namaWilayah: true } },
            FotoSampah: true,
          },
        },
      },
    });

    if (!transaksi) {
      return NextResponse.json(
        { error: 'Transaksi tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json(transaksi);
  } catch (error) {
    console.error('Get transaksi error:', error);
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
    const { status } = await request.json();
    const { id } = await params;

    if (!status) {
      return NextResponse.json(
        { error: 'Status harus diisi' },
        { status: 400 }
      );
    }

    const validStatuses: string[] = ['PENDING', 'SELESAI', 'BATAL'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Status tidak valid' },
        { status: 400 }
      );
    }

    const transaksi = await prisma.transaksi.update({
      where: { id },
      data: { status: status as StatusTransaksi },
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

    return NextResponse.json(transaksi);
  } catch (error) {
    console.error('Update transaksi error:', error);
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

    const transaksi = await prisma.transaksi.findUnique({
      where: { id },
    });

    if (!transaksi) {
      return NextResponse.json(
        { error: 'Transaksi tidak ditemukan' },
        { status: 404 }
      );
    }

    await prisma.transaksi.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Transaksi berhasil dihapus' });
  } catch (error) {
    console.error('Delete transaksi error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}