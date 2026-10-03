import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { hashPassword } from '@/app/lib/auth';
import {
  cleanNoHp,
  isValidNoHp,
  NO_HP_MAX_LENGTH,
  NO_HP_MIN_DIGITS,
  noHpVariants,
} from '@/app/lib/phone';

export async function POST(request: Request) {
  try {
    const { nama, nik, email, noHp, password, alamat } = await request.json();

    const trimmedNama = typeof nama === 'string' ? nama.trim() : '';
    const trimmedNik = typeof nik === 'string' ? nik.trim() : '';
    const trimmedEmail = typeof email === 'string' ? email.trim() : '';
    const trimmedNoHp = cleanNoHp(noHp);
    const trimmedAlamat = typeof alamat === 'string' ? alamat.trim() : '';

    // Validasi input
    if (!trimmedNama || !trimmedNik || !trimmedEmail || !trimmedNoHp || !password) {
      return NextResponse.json(
        { error: 'Semua field harus diisi' },
        { status: 400 }
      );
    }

    if (trimmedNama.length > 100) {
      return NextResponse.json(
        { error: 'Nama terlalu panjang (maksimal 100 karakter)' },
        { status: 400 }
      );
    }

    if (trimmedNik.length > 16) {
      return NextResponse.json(
        { error: 'NIK terlalu panjang (maksimal 16 karakter)' },
        { status: 400 }
      );
    }

    if (trimmedEmail.length > 100) {
      return NextResponse.json(
        { error: 'Email terlalu panjang (maksimal 100 karakter)' },
        { status: 400 }
      );
    }

    if (!isValidNoHp(trimmedNoHp)) {
      return NextResponse.json(
        { error: `No HP tidak valid (minimal ${NO_HP_MIN_DIGITS} digit angka, maksimal ${NO_HP_MAX_LENGTH} karakter)` },
        { status: 400 }
      );
    }

    if (password.length > 255) {
      return NextResponse.json(
        { error: 'Password terlalu panjang (maksimal 255 karakter)' },
        { status: 400 }
      );
    }

    // Cek email duplikat
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: trimmedEmail },
          { nik: trimmedNik },
          { noHp: { in: noHpVariants(trimmedNoHp) } },
        ],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email, NIK, atau No HP sudah terdaftar' },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        nama: trimmedNama,
        nik: trimmedNik,
        email: trimmedEmail,
        noHp: trimmedNoHp,
        password: hashedPassword,
        alamat: trimmedAlamat,
        role: 'USER',
      },
    });

    return NextResponse.json(
      {
        message: 'Registrasi berhasil',
        user: {
          id: user.id,
          nama: user.nama,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}