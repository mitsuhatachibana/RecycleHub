import { NextResponse } from 'next/server';
import { prisma, Prisma } from '@/app/lib/prisma';
import { requireAuth, hashPassword } from '@/app/lib/auth';
import {
  cleanNoHp,
  isValidNoHp,
  NO_HP_MAX_LENGTH,
  NO_HP_MIN_DIGITS,
  noHpVariants,
} from '@/app/lib/phone';

// GET user by ID (Admin only)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth('ADMIN');
    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
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
        updatedAt: true,
        _count: {
          select: {
            LaporanSampah: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}

// PUT update user (Admin only)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth('ADMIN');
    const { nama, nik, email, noHp: noHpInput, password, alamat, role } = await request.json();
    const { id } = await params;
    const noHp = noHpInput === undefined ? undefined : cleanNoHp(noHpInput);

    if (nama && nama.length > 100) {
      return NextResponse.json(
        { error: 'Nama terlalu panjang (maksimal 100 karakter)' },
        { status: 400 }
      );
    }

    if (nik && nik.length > 16) {
      return NextResponse.json(
        { error: 'NIK terlalu panjang (maksimal 16 karakter)' },
        { status: 400 }
      );
    }

    if (email && email.length > 100) {
      return NextResponse.json(
        { error: 'Email terlalu panjang (maksimal 100 karakter)' },
        { status: 400 }
      );
    }

    if (noHp !== undefined && noHp !== '' && !isValidNoHp(noHp)) {
      return NextResponse.json(
        { error: `No HP tidak valid (minimal ${NO_HP_MIN_DIGITS} digit angka, maksimal ${NO_HP_MAX_LENGTH} karakter)` },
        { status: 400 }
      );
    }

    if (password && password.length > 255) {
      return NextResponse.json(
        { error: 'Password terlalu panjang (maksimal 255 karakter)' },
        { status: 400 }
      );
    }

    // Cek user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    // Cek duplikat (exclude current user)
    const duplicateOr: Prisma.UserWhereInput[] = [];
    if (email) duplicateOr.push({ email });
    if (nik) duplicateOr.push({ nik });
    if (noHp) duplicateOr.push({ noHp: { in: noHpVariants(noHp) } });

    if (duplicateOr.length > 0) {
      const duplicateUser = await prisma.user.findFirst({
        where: {
          AND: [{ id: { not: id } }, { OR: duplicateOr }],
        },
        select: { id: true },
      });

      if (duplicateUser) {
        return NextResponse.json(
          { error: 'Email, NIK, atau No HP sudah digunakan user lain' },
          { status: 400 }
        );
      }
    }

    type UpdateUserData = {
      nama?: string | null;
      nik?: string | null;
      email?: string | null;
      noHp?: string | null;
      alamat?: string | null;
      role?: string | null;
      password?: string | null;
    };

    const updateData: UpdateUserData = {
      nama,
      nik,
      email,
      noHp,
      alamat,
      role,
    };

    if (password) {
      updateData.password = await hashPassword(password);
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData as Prisma.UserUpdateInput,
      select: {
        id: true,
        nama: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}

// DELETE user (Admin only)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
   try {
    await requireAuth('ADMIN');
    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    // Cek jika user memiliki laporan
    const hasLaporan = await prisma.laporanSampah.count({
      where: { userId: id },
    });

    if (hasLaporan > 0) {
      return NextResponse.json(
        { error: 'Tidak dapat menghapus user yang memiliki laporan' },
        { status: 400 }
      );
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'User berhasil dihapus' });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}