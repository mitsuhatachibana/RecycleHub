import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { verifyPassword, generateToken } from '@/app/lib/auth';
import { cookies } from 'next/headers';
import { z } from 'zod';

// Schema validasi dengan Zod
const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

export async function POST(request: Request) {
  try {
    // Parse request body
    const body = await request.json();
    
    // Validasi input
    const validationResult = loginSchema.safeParse(body);
    if (!validationResult.success) {
      const errors = validationResult.error.issues.map((err: z.ZodIssue) => err.message);
      return NextResponse.json(
        { 
          error: 'Validasi gagal', 
          details: errors 
        },
        { status: 400 }
      );
    }

    const { email, password: passwordInput } = validationResult.data;

    // Cari user berdasarkan email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        nama: true,
        email: true,
        password: true,
        role: true,
        fotoProfil: true,
        nik: true,
        noHp: true,
        alamat: true,
      },
    });

    // Jika user tidak ditemukan
    if (!user) {
      return NextResponse.json(
        { error: 'Email atau password salah' },
        { status: 401 }
      );
    }

    // Verifikasi password
    const isValidPassword = await verifyPassword(passwordInput, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Email atau password salah' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 hari
      path: '/',
    });

    // Log aktivitas login (optional)
    await prisma.$executeRaw`
      INSERT INTO "audit_logs" ("userId", "action", "ipAddress", "userAgent", "createdAt")
      VALUES (${user.id}, 'LOGIN', ${request.headers.get('x-forwarded-for') || 'unknown'}, ${request.headers.get('user-agent') || 'unknown'}, NOW())
    `.catch(() => {}); // Ignore if table doesn't exist

    // Return response tanpa password
    const { password, ...userWithoutPassword } = user;
    void password;

    return NextResponse.json({
      success: true,
      message: 'Login berhasil',
      user: userWithoutPassword,
      token, // Optional: kirim token jika diperlukan client-side
    });
  } catch (error) {
    console.error('Login error:', error);
    
    // Error handling yang lebih detail
    if (error instanceof Error) {
      return NextResponse.json(
        { error: 'Terjadi kesalahan pada server: ' + error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}