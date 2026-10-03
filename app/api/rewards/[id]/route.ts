import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { requireAuth } from '@/app/lib/auth';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { join } from 'path';

const REWARD_IMAGE_DIR = join(process.cwd(), 'public', 'images', 'rewards');

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth('ADMIN');
    const { id } = await params;
    const contentType = request.headers.get('content-type') || '';

    const existing = await prisma.reward.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Reward tidak ditemukan' },
        { status: 404 }
      );
    }

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      const nama = formData.get('nama') as string;
      const deskripsi = formData.get('deskripsi') as string;
      const poin = parseInt(formData.get('poin') as string);
      const stok = parseInt(formData.get('stok') as string);

      let gambar = existing.gambar;
      if (file && file.size > 0) {
        await mkdir(REWARD_IMAGE_DIR, { recursive: true });
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const ext = file.name.split('.').pop() || 'jpg';
        const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const filepath = join(REWARD_IMAGE_DIR, filename);
        await writeFile(filepath, buffer);
        gambar = `/images/rewards/${filename}`;

        if (existing.gambar) {
          const oldPath = join(process.cwd(), 'public', existing.gambar);
          await unlink(oldPath).catch(() => {});
        }
      }

      const reward = await prisma.reward.update({
        where: { id },
        data: {
          nama,
          deskripsi,
          poin,
          stok,
          gambar,
        },
      });

      return NextResponse.json(reward);
    }

    const body = await request.json();
    const reward = await prisma.reward.update({
      where: { id },
      data: {
        nama: body.nama,
        deskripsi: body.deskripsi,
        poin: parseInt(body.poin),
        stok: parseInt(body.stok),
        gambar: body.gambar,
      },
    });

    return NextResponse.json(reward);
  } catch (error) {
    console.error('Update reward error:', error);
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

    const existing = await prisma.reward.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Reward tidak ditemukan' },
        { status: 404 }
      );
    }

    await prisma.reward.delete({ where: { id } });

    if (existing.gambar) {
      const filepath = join(process.cwd(), 'public', existing.gambar);
      await unlink(filepath).catch(() => {});
    }

    return NextResponse.json({ message: 'Reward berhasil dihapus' });
  } catch (error) {
    console.error('Delete reward error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}
