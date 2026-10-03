import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { requireAuth } from '@/app/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await requireAuth();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const skip = (page - 1) * limit;

    const where: any = {};
    if (session.role === 'USER') {
      where.userId = session.id;
    }

    const [redeems, total] = await Promise.all([
      prisma.redeem.findMany({
        where,
        include: {
          reward: true,
          user: { select: { id: true, nama: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.redeem.count({ where }),
    ]);

    return NextResponse.json({
      data: redeems,
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    console.error('Get redeem error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAuth();
    const { rewardId } = await request.json();

    if (!rewardId) {
      return NextResponse.json(
        { error: 'Reward ID harus diisi' },
        { status: 400 }
      );
    }

    const reward = await prisma.reward.findUnique({
      where: { id: rewardId },
    });

    if (!reward) {
      return NextResponse.json(
        { error: 'Reward tidak ditemukan' },
        { status: 404 }
      );
    }

    if (reward.stok <= 0) {
      return NextResponse.json(
        { error: 'Stok reward habis' },
        { status: 400 }
      );
    }

    const userPoin = await prisma.poin.findUnique({
      where: { userId: session.id },
    });

    if (!userPoin || userPoin.jumlahPoin < reward.poin) {
      return NextResponse.json(
        { error: 'Poin Anda tidak cukup' },
        { status: 400 }
      );
    }

    const redeem = await prisma.redeem.create({
      data: {
        userId: session.id,
        rewardId,
        poinDigunakan: reward.poin,
        status: 'PENDING',
      },
      include: {
        reward: true,
        user: { select: { id: true, nama: true, email: true } },
      },
    });

    await prisma.$transaction([
      prisma.poin.update({
        where: { userId: session.id },
        data: { jumlahPoin: { decrement: reward.poin } },
      }),
      prisma.reward.update({
        where: { id: rewardId },
        data: { stok: { decrement: 1 } },
      }),
    ]);

    return NextResponse.json(redeem, { status: 201 });
  } catch (error) {
    console.error('Create redeem error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}
