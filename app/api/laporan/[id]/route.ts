import { NextResponse } from 'next/server';
import { prisma, Prisma } from '@/app/lib/prisma';
import { requireAuth } from '@/app/lib/auth';
import { StatusLaporan } from '@/app/generated/prisma/enums';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    const body = await request.json();
    const { status, jenisSampahId, wilayahId, berat, deskripsi } = body;

    const existing = await prisma.laporanSampah.findUnique({
      where: { id },
      select: { userId: true, status: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Laporan tidak ditemukan' },
        { status: 404 }
      );
    }

    if (session.role !== 'ADMIN' && existing.userId !== session.id) {
      return NextResponse.json(
        { error: 'Anda tidak memiliki akses ke laporan ini' },
        { status: 403 }
      );
    }

    if (status && session.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Hanya admin yang dapat mengubah status' },
        { status: 403 }
      );
    }

    const data: Prisma.LaporanSampahUpdateInput = {};

    if (status) {
      if (!['MENUNGGU', 'DIPROSES', 'SELESAI', 'DITOLAK'].includes(status)) {
        return NextResponse.json(
          { error: 'Status tidak valid' },
          { status: 400 }
        );
      }
      data.status = status as StatusLaporan;
    }

    if (jenisSampahId) {
      data.jenisSampah = { connect: { id: jenisSampahId } };
    }
    if (wilayahId) {
      data.wilayah = { connect: { id: wilayahId } };
    }
    if (berat !== undefined) data.berat = parseFloat(berat);
    if (deskripsi !== undefined) data.deskripsi = deskripsi;

    const laporan = await prisma.laporanSampah.update({
      where: { id },
      data,
      include: {
        user: { select: { id: true, nama: true, email: true } },
        jenisSampah: { select: { id: true, namaJenis: true, hargaPerKg: true } },
        wilayah: { select: { id: true, namaWilayah: true } },
        FotoSampah: true,
        Transaksi: { select: { id: true, totalHarga: true, status: true } },
      },
    });

    return NextResponse.json(laporan);
  } catch (error) {
    console.error('Update laporan error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    const existing = await prisma.laporanSampah.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Laporan tidak ditemukan' },
        { status: 404 }
      );
    }

    if (session.role !== 'ADMIN' && existing.userId !== session.id) {
      return NextResponse.json(
        { error: 'Anda tidak memiliki akses ke laporan ini' },
        { status: 403 }
      );
    }

    await prisma.laporanSampah.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Laporan berhasil dihapus' });
  } catch (error) {
    console.error('Delete laporan error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}