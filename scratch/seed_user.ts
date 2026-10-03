import 'dotenv/config';
import { prisma } from '../app/lib/prisma';
import bcrypt from 'bcryptjs';

async function seedUser() {
  const pass = await bcrypt.hash('user123', 10);
  const u = await prisma.user.upsert({
    where: { email: 'user@recyclehub.com' },
    update: {},
    create: {
      nama: 'Budi Santoso',
      nik: '3171012345678901',
      email: 'user@recyclehub.com',
      noHp: '081987654321',
      password: pass,
      role: 'USER',
      alamat: 'Jl. Merdeka No. 45, Jakarta Selatan',
    },
  });

  await prisma.poin.upsert({
    where: { userId: u.id },
    update: { jumlahPoin: 250, totalPoinDikumpulkan: 500 },
    create: { userId: u.id, jumlahPoin: 250, totalPoinDikumpulkan: 500 },
  });

  const jenis = await prisma.jenisSampah.findFirst();
  const wilayah = await prisma.wilayah.findFirst();

  if (jenis && wilayah) {
    const l1 = await prisma.laporanSampah.create({
      data: {
        userId: u.id,
        jenisSampahId: jenis.id,
        wilayahId: wilayah.id,
        berat: 12.5,
        deskripsi: 'Penetoran botol plastik bekas minuman & kemasan',
        status: 'SELESAI',
      }
    });

    await prisma.transaksi.create({
      data: {
        userId: u.id,
        laporanId: l1.id,
        totalHarga: 12.5 * jenis.hargaPerKg,
        status: 'SELESAI',
      }
    });

    await prisma.laporanSampah.create({
      data: {
        userId: u.id,
        jenisSampahId: jenis.id,
        wilayahId: wilayah.id,
        berat: 5.0,
        deskripsi: 'Kardus bekas kardus kemasan bersih',
        status: 'MENUNGGU',
      }
    });
  }

  console.log('✅ Demo USER account created:', u.email);
}

seedUser()
  .catch(console.error)
  .finally(() => process.exit(0));
