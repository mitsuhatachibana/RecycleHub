import { NextResponse } from 'next/server';
import { getSession } from '@/app/lib/auth';
import { prisma, Prisma } from '@/app/lib/prisma';
import {
  cleanNoHp,
  isValidNoHp,
  NO_HP_MAX_LENGTH,
  NO_HP_MIN_DIGITS,
  noHpVariants,
} from '@/app/lib/phone';

export async function GET() {
  try {
    const user = await getSession();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Get session error:', error);

    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { nama, noHp, alamat } = await request.json();

    const trimmedNama = typeof nama === 'string' ? nama.trim() : '';
    const trimmedNoHp = cleanNoHp(noHp);
    const trimmedAlamat = typeof alamat === 'string' ? alamat.trim() : '';

    if (!trimmedNama) {
      return NextResponse.json(
        { error: 'Nama harus diisi' },
        { status: 400 }
      );
    }

    if (trimmedNama.length > 100) {
      return NextResponse.json(
        { error: 'Nama terlalu panjang (maksimal 100 karakter)' },
        { status: 400 }
      );
    }

    if (!trimmedNoHp) {
      return NextResponse.json(
        { error: 'No HP harus diisi' },
        { status: 400 }
      );
    }

    if (!isValidNoHp(trimmedNoHp)) {
      return NextResponse.json(
        { error: `No HP tidak valid (minimal ${NO_HP_MIN_DIGITS} digit angka, maksimal ${NO_HP_MAX_LENGTH} karakter)` },
        { status: 400 }
      );
    }

    const duplicate = await prisma.user.findFirst({
      where: { noHp: { in: noHpVariants(trimmedNoHp) }, NOT: { id: session.id } },
      select: { id: true },
    });

    if (duplicate) {
      return NextResponse.json(
        { error: 'No HP sudah digunakan akun lain' },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.id },
      data: {
        nama: trimmedNama,
        noHp: trimmedNoHp,
        alamat: trimmedAlamat,
      },
      select: {
        id: true,
        nama: true,
        nik: true,
        email: true,
        noHp: true,
        role: true,
        alamat: true,
        fotoProfil: true,
        createdAt: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Update profile error:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2000') {
        return NextResponse.json(
          { error: 'Data terlalu panjang untuk kolom database. Periksa panjang nama dan No HP.' },
          { status: 400 }
        );
      }

      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'No HP sudah digunakan user lain' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}
