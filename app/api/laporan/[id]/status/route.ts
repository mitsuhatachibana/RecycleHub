import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { requireAuth } from '@/app/lib/auth';
import { StatusLaporan } from '@/app/generated/prisma/enums';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth('ADMIN');
  } catch (authError) {
    console.error('Auth error:', authError);
    return NextResponse.json(
      { error: authError instanceof Error ? authError.message : 'Unauthorized' },
      { status: authError instanceof Error && authError.message === 'Forbidden' ? 403 : 401 }
    );
  }

  try {
    const { id } = await params;
    const { status } = await request.json();

    if (!status) {
      return NextResponse.json(
        { error: 'Status harus diisi' },
        { status: 400 }
      );
    }

    const validStatuses: string[] = ['MENUNGGU', 'DIPROSES', 'SELESAI', 'DITOLAK'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Status tidak valid' },
        { status: 400 }
      );
    }

    const laporan = await prisma.laporanSampah.update({
      where: { id },
      data: { status: status as StatusLaporan },
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
    console.error('Update laporan status error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}
