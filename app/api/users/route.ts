import { NextResponse } from 'next/server';
import { prisma, Prisma } from '@/app/lib/prisma';
import { requireAuth, hashPassword } from '@/app/lib/auth';
import { Role } from '@/app/generated/prisma/enums';
import {
  cleanNoHp,
  isValidNoHp,
  NO_HP_MAX_LENGTH,
  NO_HP_MIN_DIGITS,
  noHpVariants,
} from '@/app/lib/phone';

// GET semua user (Admin only)
export async function GET(request: Request) {
  try {
    await requireAuth('ADMIN');

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';
    const sort = searchParams.get('sort') || 'newest';

    const where: Prisma.UserWhereInput = {};

    if (search) {
      where.OR = [
        { nama: { contains: search } },
        { email: { contains: search } },
        { nik: { contains: search } },
      ];
    }

    if (role) {
      where.role = role as Role;
    }

    const orderBy: Prisma.UserOrderByWithRelationInput = {
      createdAt: sort === 'oldest' ? 'asc' : 'desc',
    };

    if (sort === 'name') {
      orderBy.nama = 'asc';
      delete orderBy.createdAt;
    } else if (sort === 'name_desc') {
      orderBy.nama = 'desc';
      delete orderBy.createdAt;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
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
          _count: {
            select: {
              LaporanSampah: true,
            },
          },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      data: users,
      total,
      totalPages,
      page,
      limit,
    });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}

// POST create user (Admin only)
export async function POST(request: Request) {
  try {
    await requireAuth('ADMIN');
    const { nama, nik, email, noHp: noHpInput, password, alamat, role } = await request.json();
    const noHp = cleanNoHp(noHpInput);

    // Validasi input
    if (!nama || !nik || !email || !noHp || !password) {
      return NextResponse.json(
        { error: 'Semua field harus diisi' },
        { status: 400 }
      );
    }

    if (nama.length > 100) {
      return NextResponse.json(
        { error: 'Nama terlalu panjang (maksimal 100 karakter)' },
        { status: 400 }
      );
    }

    if (nik.length > 16) {
      return NextResponse.json(
        { error: 'NIK terlalu panjang (maksimal 16 karakter)' },
        { status: 400 }
      );
    }

    if (email.length > 100) {
      return NextResponse.json(
        { error: 'Email terlalu panjang (maksimal 100 karakter)' },
        { status: 400 }
      );
    }

    if (!isValidNoHp(noHp)) {
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

    // Cek duplikat
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { nik }, { noHp: { in: noHpVariants(noHp) } }],
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
        nama,
        nik,
        email,
        noHp,
        password: hashedPassword,
        alamat,
        role: role || 'USER',
      },
      select: {
        id: true,
        nama: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}