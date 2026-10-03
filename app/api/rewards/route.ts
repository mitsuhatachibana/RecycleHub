import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { requireAuth } from '@/app/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

const REWARD_IMAGE_DIR = join(process.cwd(), 'public', 'images', 'rewards');

async function ensureDir() {
  try {
    await mkdir(REWARD_IMAGE_DIR, { recursive: true });
  } catch {
    // ignore
  }
}

export async function GET(request: Request) {
  try {
    await requireAuth();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    const where: any = {};
    if (search) {
      where.nama = { contains: search, mode: 'insensitive' };
    }

    const rewards = await prisma.reward.findMany({
      where,
      orderBy: { poin: 'asc' },
    });

    return NextResponse.json(rewards);
  } catch (error) {
    console.error('Get rewards error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAuth('ADMIN');
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      const nama = formData.get('nama') as string;
      const deskripsi = formData.get('deskripsi') as string;
      const poin = parseInt(formData.get('poin') as string);
      const stok = parseInt(formData.get('stok') as string);

      if (!file) {
        return NextResponse.json(
          { error: 'File gambar harus diupload' },
          { status: 400 }
        );
      }

      await ensureDir();
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const ext = file.name.split('.').pop() || 'jpg';
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const filepath = join(REWARD_IMAGE_DIR, filename);
      await writeFile(filepath, buffer);
      const gambar = `/images/rewards/${filename}`;

      const reward = await prisma.reward.create({
        data: {
          nama,
          deskripsi,
          poin,
          stok,
          gambar,
        },
      });

      return NextResponse.json(reward, { status: 201 });
    }

    const body = await request.json();

    const reward = await prisma.reward.create({
      data: {
        nama: body.nama,
        deskripsi: body.deskripsi,
        poin: parseInt(body.poin),
        stok: parseInt(body.stok),
        gambar: body.gambar,
      },
    });

    return NextResponse.json(reward, { status: 201 });
  } catch (error) {
    console.error('Create reward error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}
