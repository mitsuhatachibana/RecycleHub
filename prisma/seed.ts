import { PrismaClient } from '@/app/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Seed Admin
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'adminRecycleHub@gmail.com' },
    update: {},
    create: {
      nama: 'Admin RecycleHub',
      nik: '0000000000000000',
      email: 'adminRecycleHub@gmail.com',
      noHp: '081234567890',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  // Seed Jenis Sampah
  const jenisSampah = [
    { namaJenis: 'Plastik', deskripsi: 'Botol, kemasan, kantong plastik', hargaPerKg: 5000 },
    { namaJenis: 'Kertas', deskripsi: 'Kertas koran, kardus, kertas kemasan', hargaPerKg: 3000 },
    { namaJenis: 'Logam', deskripsi: 'Kaleng, logam feris, aluminium', hargaPerKg: 8000 },
    { namaJenis: 'Kaca', deskripsi: 'Botol kaca, pecahan kaca', hargaPerKg: 4000 },
    { namaJenis: 'Organik', deskripsi: 'Sisa makanan, kulit buah, daun', hargaPerKg: 2000 },
    { namaJenis: 'Elektronik', deskripsi: 'Barang elektronik bekas', hargaPerKg: 10000 },
    { namaJenis: 'Nonorganik', deskripsi: 'Sampah tekstil, sepatu, mainan', hargaPerKg: 1500 },
    { namaJenis: 'Residu', deskripsi: 'Sampah tidak dapat didaur ulang', hargaPerKg: 500 },
    { namaJenis: 'B3', deskripsi: 'Bahan berbahaya dan beracun', hargaPerKg: 10000 },
  ];

  for (const jenis of jenisSampah) {
    await prisma.jenisSampah.upsert({
      where: { namaJenis: jenis.namaJenis },
      update: { deskripsi: jenis.deskripsi, hargaPerKg: jenis.hargaPerKg },
      create: jenis,
    });
  }

  // Seed Wilayah
  const wilayah = [
    'Jakarta Pusat',
    'Jakarta Barat',
    'Jakarta Selatan',
    'Jakarta Timur',
    'Jakarta Utara',
    'Bandung',
    'Cirebon',
    'Sumedang',
    'Sleman, D.I. Yogyakarta',
    'Bantul, D.I. Yogyakarta',
    'Surabaya',
    'Bogor',
    'Depok',
  ];

  for (const namaWilayah of wilayah) {
    await prisma.wilayah.upsert({
      where: { namaWilayah },
      update: {},
      create: { namaWilayah },
    });
  }

  // Seed Poin untuk admin
  await prisma.poin.upsert({
    where: { userId: admin.id },
    update: {},
    create: { userId: admin.id, jumlahPoin: 0, totalPoinDikumpulkan: 0 },
  });

  // Seed Rewards
  const rewards = [
    { nama: 'Tas Totebag', deskripsi: 'Tas belanja ramah lingkungan', poin: 100, stok: 50, gambar: '/images/rewards/tas-totebag.jpg' },
    { nama: 'Tempat Pensil', deskripsi: 'Tempat pensil dari bahan daur ulang', poin: 50, stok: 100, gambar: '/images/rewards/tempat-pensil.jpg' },
    { nama: 'Mug Eco-Friendly', deskripsi: 'Mug keramik ramah lingkungan', poin: 75, stok: 30, gambar: '/images/rewards/mug.jpg' },
    { nama: 'Notebook Kertas daur ulang', deskripsi: 'Buku catatan dari kertas daur ulang', poin: 60, stok: 40, gambar: '/images/rewards/notebook.jpg' },
    { nama: 'Pouch Serbaguna', deskripsi: 'Pouch kecil dari kain daur ulang', poin: 40, stok: 60, gambar: '/images/rewards/pouch.jpg' },
    { nama: 'Stainless Steel Straw', deskripsi: 'Sedotan stainless steel dengan kotak', poin: 30, stok: 80, gambar: '/images/rewards/straw.jpg' },
  ];

  for (const reward of rewards) {
    await prisma.reward.upsert({
      where: { nama: reward.nama },
      update: { deskripsi: reward.deskripsi, poin: reward.poin, stok: reward.stok, gambar: reward.gambar },
      create: reward,
    });
  }

  console.log('✅ Seed data completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });