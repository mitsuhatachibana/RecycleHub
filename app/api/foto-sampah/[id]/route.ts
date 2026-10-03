import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { requireAuth } from '@/app/lib/auth';
import { unlink } from 'fs/promises';
import { join } from 'path';

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads');

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    const foto = await prisma.fotoSampah.findUnique({
      where: { id },
      include: {
        laporan: { select: { userId: true } },
      },
    });

    if (!foto) {
      return NextResponse.json(
        { error: 'Foto tidak ditemukan' },
        { status: 404 }
      );
    }

    if (foto.laporan.userId !== session.id && session.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Anda tidak memiliki akses ke foto ini' },
        { status: 403 }
      );
    }

    await prisma.fotoSampah.delete({ where: { id } });

    const filename = foto.urlFoto.replace(/^\/uploads\//, '');
    if (filename) {
      await unlink(join(UPLOAD_DIR, filename)).catch(() => {});
    }

    return NextResponse.json({ message: 'Foto berhasil dihapus' });
  } catch (error) {
    console.error('Delete foto sampah error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}
