const pptxgen = require('pptxgenjs');
const path = require('path');
const fs = require('fs');

const pptx = new pptxgen();
pptx.layout = 'LAYOUT_16x9';

// Color Palette (Eco-Green Theme matching Website)
const COLOR_PRIMARY = '16A34A';      // Green-600
const COLOR_DARK = '064E3B';         // Green-900 / Emerald Dark
const COLOR_ACCENT = '22C55E';       // Green-500
const COLOR_BG_LIGHT = 'F0FDF4';     // Green-50
const COLOR_CARD_BG = 'FFFFFF';      // Pure White
const COLOR_TEXT_DARK = '1F2937';    // Gray-800
const COLOR_TEXT_MUTED = '6B7280';   // Gray-500
const COLOR_YELLOW = 'EAB308';       // Amber-500
const COLOR_BORDER = 'E5E7EB';       // Gray-200

const ssDir = path.join(__dirname, '../public/screenshots');

function getSS(name) {
  const p = path.join(ssDir, name);
  return fs.existsSync(p) ? p : null;
}

// -----------------------------------------------------------------------------
// SLIDE 1: COVER
// -----------------------------------------------------------------------------
let slide1 = pptx.addSlide();
slide1.background = { color: 'F9FAFB' };

// Left Header Green Block
slide1.addShape(pptx.shapes.RECTANGLE, { x: 0.5, y: 0.8, w: 0.3, h: 4.8, fill: { color: COLOR_PRIMARY } });

// Main Card Frame
slide1.addShape(pptx.shapes.RECTANGLE, { x: 1.0, y: 0.8, w: 11.3, h: 5.8, fill: { color: 'FFFFFF' }, line: { color: COLOR_BORDER, width: 1 } });
slide1.addShape(pptx.shapes.RECTANGLE, { x: 1.0, y: 0.8, w: 11.3, h: 0.15, fill: { color: COLOR_PRIMARY } });

// Big Header Text
slide1.addText('RECYCLEHUB', { x: 1.4, y: 1.4, w: 8.0, h: 0.6, fontSize: 36, bold: true, color: COLOR_PRIMARY, fontFace: 'Helvetica' });
slide1.addText('USER MANUAL & SYSTEM HANDBOOK 2026', { x: 1.4, y: 2.1, w: 8.0, h: 0.4, fontSize: 20, bold: true, color: COLOR_DARK, fontFace: 'Helvetica' });

slide1.addText('Panduan Penggunaan Lengkap Berbasis Role (User & Admin) serta Penjelasan Arsitektur Basis Data (Constraint, RDBMS Relasi, Normalisasi 1NF-3NF)', {
  x: 1.4, y: 2.7, w: 7.5, h: 1.0, fontSize: 13, color: COLOR_TEXT_MUTED, fontFace: 'Helvetica', align: 'left'
});

// Image preview thumbnail box on cover
const landingImg = getSS('landing.png');
if (landingImg) {
  slide1.addImage({ path: landingImg, x: 7.5, y: 2.0, w: 4.3, h: 2.7, rounding: true });
}

// Metadata Card
slide1.addShape(pptx.shapes.RECTANGLE, { x: 1.4, y: 4.8, w: 10.5, h: 1.3, fill: { color: COLOR_BG_LIGHT }, line: { color: COLOR_PRIMARY, width: 1 } });
slide1.addText([
  { text: 'Aplikasi: ', options: { bold: true, color: COLOR_DARK } },
  { text: 'RecycleHub Daur Ulang & Manajemen Sampah\n', options: { color: COLOR_TEXT_DARK } },
  { text: 'Platform: ', options: { bold: true, color: COLOR_DARK } },
  { text: 'Next.js 16 App Router + Prisma ORM + PostgreSQL\n', options: { color: COLOR_TEXT_DARK } },
  { text: 'Versi Dokumen: ', options: { bold: true, color: COLOR_DARK } },
  { text: '1.0.0 (Tahun 2026) | Laporan Resmi Kelompok', options: { color: COLOR_TEXT_DARK } }
], { x: 1.6, y: 4.9, w: 10.0, h: 1.1, fontSize: 11, fontFace: 'Helvetica' });


// -----------------------------------------------------------------------------
// SLIDE 2: DAFTAR ISI (PAGE OF CONTENTS)
// -----------------------------------------------------------------------------
let slide2 = pptx.addSlide();
slide2.background = { color: 'F9FAFB' };

// Title Header
slide2.addShape(pptx.shapes.RECTANGLE, { x: 0.6, y: 0.5, w: 3.5, h: 0.5, fill: { color: COLOR_PRIMARY } });
slide2.addText('DAFTAR ISI HANDBOOK', { x: 0.7, y: 0.5, w: 3.3, h: 0.5, fontSize: 14, bold: true, color: 'FFFFFF', fontFace: 'Helvetica' });

// 4 Module Cards
const modules = [
  { num: '01', title: 'Ringkasan & Fitur Utama', desc: 'Pengenalan sistem RecycleHub, tujuan arsitektur, dan alur bisnis pengelolaan sampah.', color: COLOR_PRIMARY },
  { num: '02', title: 'Panduan Role USER', desc: 'Registrasi akun, pengajuan laporan setor sampah, katalog reward, redeem poin, dan riwayat transaksi.', color: '059669' },
  { num: '03', title: 'Panduan Role ADMIN', desc: 'Verifikasi laporan, manajemen transaksi, approval penukaran reward, serta kelola master data (Jenis, Wilayah, Users).', color: '047857' },
  { num: '04', title: 'Dokumentasi Basis Data', desc: 'Implementasi Constraint (PK, Unique, NOT NULL, Default), Relasi RDBMS (1:1, 1:N, N:M), dan Normalisasi BD (1NF, 2NF, 3NF).', color: '064E3B' },
];

modules.forEach((mod, idx) => {
  const x = (idx % 2 === 0) ? 0.6 : 6.8;
  const y = (idx < 2) ? 1.4 : 4.0;

  slide2.addShape(pptx.shapes.RECTANGLE, { x, y, w: 5.8, h: 2.2, fill: { color: COLOR_CARD_BG }, line: { color: COLOR_BORDER, width: 1 } });
  slide2.addShape(pptx.shapes.RECTANGLE, { x, y, w: 0.8, h: 2.2, fill: { color: mod.color } });
  slide2.addText(mod.num, { x, y: y + 0.7, w: 0.8, h: 0.8, fontSize: 22, bold: true, color: 'FFFFFF', align: 'center', fontFace: 'Helvetica' });

  slide2.addText(mod.title, { x: x + 1.0, y: y + 0.2, w: 4.6, h: 0.4, fontSize: 16, bold: true, color: COLOR_DARK, fontFace: 'Helvetica' });
  slide2.addText(mod.desc, { x: x + 1.0, y: y + 0.7, w: 4.6, h: 1.3, fontSize: 11, color: COLOR_TEXT_MUTED, fontFace: 'Helvetica' });
});


// -----------------------------------------------------------------------------
// SLIDE 3: OVERVIEW & ALUR SISTEM
// -----------------------------------------------------------------------------
let slide3 = pptx.addSlide();
slide3.background = { color: 'F9FAFB' };

slide3.addShape(pptx.shapes.RECTANGLE, { x: 0.6, y: 0.5, w: 4.5, h: 0.5, fill: { color: COLOR_PRIMARY } });
slide3.addText('01. RINGKASAN ALUR SISTEM', { x: 0.7, y: 0.5, w: 4.3, h: 0.5, fontSize: 14, bold: true, color: 'FFFFFF', fontFace: 'Helvetica' });

// Screenshot Landing
const ssLanding = getSS('landing.png');
if (ssLanding) {
  slide3.addImage({ path: ssLanding, x: 0.6, y: 1.3, w: 6.2, h: 5.2, rounding: true });
}

// Right Explanation Box
slide3.addShape(pptx.shapes.RECTANGLE, { x: 7.1, y: 1.3, w: 5.5, h: 5.2, fill: { color: COLOR_CARD_BG }, line: { color: COLOR_BORDER, width: 1 } });
slide3.addText('Tujuan & Alur Kerja Utama Platform', { x: 7.3, y: 1.5, w: 5.1, h: 0.4, fontSize: 16, bold: true, color: COLOR_DARK, fontFace: 'Helvetica' });

const alurSteps = [
  { step: '1. Registrasi & Login', text: 'Masyarakat mendaftar akun dan masuk sebagai Role USER. Admin masuk menggunakan akun resmi.' },
  { step: '2. Input Laporan Sampah', text: 'User menginput jenis sampah (Plastik, Kertas, Logam), berat (Kg), wilayah, dan deskripsi/foto.' },
  { step: '3. Verifikasi Petugas (Admin)', text: 'Admin memverifikasi laporan sampah. Status berubah dari MENUNGGU -> DIPROSES -> SELESAI.' },
  { step: '4. Pencatatan Transaksi & Poin', text: 'Sistem menghitung nilai Rupiah & memberikan EcoPoints otomatis ke akun User.' },
  { step: '5. Penukaran Reward (Redeem)', text: 'User menukarkan poin dengan produk ramah lingkungan (Totebag, Mug, Notebook).' }
];

alurSteps.forEach((s, i) => {
  const sy = 2.0 + (i * 0.85);
  slide3.addShape(pptx.shapes.RECTANGLE, { x: 7.3, y: sy, w: 5.1, h: 0.75, fill: { color: COLOR_BG_LIGHT }, line: { color: COLOR_PRIMARY, width: 1 } });
  slide3.addText(s.step, { x: 7.4, y: sy + 0.05, w: 4.9, h: 0.25, fontSize: 11, bold: true, color: COLOR_PRIMARY, fontFace: 'Helvetica' });
  slide3.addText(s.text, { x: 7.4, y: sy + 0.3, w: 4.9, h: 0.4, fontSize: 9.5, color: COLOR_TEXT_DARK, fontFace: 'Helvetica' });
});


// -----------------------------------------------------------------------------
// SLIDE 4: ROLE USER - AUTENTIKASI & REGISTRASI
// -----------------------------------------------------------------------------
let slide4 = pptx.addSlide();
slide4.background = { color: 'F9FAFB' };

slide4.addShape(pptx.shapes.RECTANGLE, { x: 0.6, y: 0.5, w: 5.5, h: 0.5, fill: { color: COLOR_PRIMARY } });
slide4.addText('02. PANDUAN USER: REGISTRASI & LOGIN', { x: 0.7, y: 0.5, w: 5.3, h: 0.5, fontSize: 14, bold: true, color: 'FFFFFF', fontFace: 'Helvetica' });

// Image 1: Register
const ssReg = getSS('register.png');
if (ssReg) {
  slide4.addImage({ path: ssReg, x: 0.6, y: 1.3, w: 5.8, h: 3.5, rounding: true });
}
slide4.addText('Gambar 4.1: Halaman Registrasi User Baru', { x: 0.6, y: 4.9, w: 5.8, h: 0.3, fontSize: 10, align: 'center', color: COLOR_TEXT_MUTED });

// Image 2: Login
const ssLog = getSS('login.png');
if (ssLog) {
  slide4.addImage({ path: ssLog, x: 6.8, y: 1.3, w: 5.8, h: 3.5, rounding: true });
}
slide4.addText('Gambar 4.2: Halaman Login Sistem', { x: 6.8, y: 4.9, w: 5.8, h: 0.3, fontSize: 10, align: 'center', color: COLOR_TEXT_MUTED });

// Step Box Bottom
slide4.addShape(pptx.shapes.RECTANGLE, { x: 0.6, y: 5.3, w: 12.0, h: 1.4, fill: { color: COLOR_CARD_BG }, line: { color: COLOR_BORDER, width: 1 } });
slide4.addText([
  { text: 'Langkah-langkah Registrasi & Autentikasi:\n', options: { bold: true, color: COLOR_PRIMARY, fontSize: 12 } },
  { text: '1. Buka website RecycleHub dan klik menu ', options: { fontSize: 10 } },
  { text: '"Daftar Sekarang"\n', options: { bold: true, fontSize: 10 } },
  { text: '2. Isi Formulir Pendaftaran: Nama Lengkap, NIK (16 digit), Email aktif, Nomor HP, Password, dan Alamat Domisili.\n', options: { fontSize: 10 } },
  { text: '3. Klik "Daftar Akun". Setelah berhasil, Anda dapat langsung masuk melalui Halaman Login menggunakan Email & Password.', options: { fontSize: 10 } }
], { x: 0.8, y: 5.4, w: 11.6, h: 1.2, fontFace: 'Helvetica' });


// -----------------------------------------------------------------------------
// SLIDE 5: ROLE USER - DASHBOARD & RINGKASAN POIN
// -----------------------------------------------------------------------------
let slide5 = pptx.addSlide();
slide5.background = { color: 'F9FAFB' };

slide5.addShape(pptx.shapes.RECTANGLE, { x: 0.6, y: 0.5, w: 5.5, h: 0.5, fill: { color: COLOR_PRIMARY } });
slide5.addText('02. PANDUAN USER: DASHBOARD UTAMA', { x: 0.7, y: 0.5, w: 5.3, h: 0.5, fontSize: 14, bold: true, color: 'FFFFFF', fontFace: 'Helvetica' });

const ssDashUser = getSS('dashboard_user.png');
if (ssDashUser) {
  slide5.addImage({ path: ssDashUser, x: 0.6, y: 1.3, w: 7.2, h: 5.3, rounding: true });
}

// Right explanation
slide5.addShape(pptx.shapes.RECTANGLE, { x: 8.1, y: 1.3, w: 4.5, h: 5.3, fill: { color: COLOR_CARD_BG }, line: { color: COLOR_BORDER, width: 1 } });
slide5.addText('Fitur-fitur Dashboard User', { x: 8.3, y: 1.5, w: 4.1, h: 0.4, fontSize: 15, bold: true, color: COLOR_DARK });

const userDashFeatures = [
  { t: 'Kartu Statistik', d: 'Menampilkan Total Laporan, Total Berat Sampah (Kg), Laporan Menunggu, & Selesai.' },
  { t: 'Saldo EcoPoints', d: 'Informasi perolehan poin aktif yang siap ditukarkan dengan hadiah/reward.' },
  { t: 'Aksi Cepat (Quick Links)', d: 'Tombol pintas menuju Laporan Baru, Riwayat Saya, Katalog Reward, & Profil.' },
  { t: 'Tabel Laporan Terbaru', d: 'Memantau perkembangan status laporan terkini secara real-time.' }
];

userDashFeatures.forEach((f, i) => {
  const fy = 2.1 + (i * 1.1);
  slide5.addShape(pptx.shapes.RECTANGLE, { x: 8.3, y: fy, w: 4.1, h: 0.95, fill: { color: COLOR_BG_LIGHT }, line: { color: COLOR_PRIMARY, width: 1 } });
  slide5.addText(f.t, { x: 8.4, y: fy + 0.1, w: 3.9, h: 0.3, fontSize: 11, bold: true, color: COLOR_PRIMARY });
  slide5.addText(f.d, { x: 8.4, y: fy + 0.4, w: 3.9, h: 0.5, fontSize: 9.5, color: COLOR_TEXT_DARK });
});


// -----------------------------------------------------------------------------
// SLIDE 6: ROLE USER - SETOR SAMPAH / BUAT LAPORAN
// -----------------------------------------------------------------------------
let slide6 = pptx.addSlide();
slide6.background = { color: 'F9FAFB' };

slide6.addShape(pptx.shapes.RECTANGLE, { x: 0.6, y: 0.5, w: 6.0, h: 0.5, fill: { color: COLOR_PRIMARY } });
slide6.addText('02. PANDUAN USER: SETOR & LAPOR SAMPAH', { x: 0.7, y: 0.5, w: 5.8, h: 0.5, fontSize: 14, bold: true, color: 'FFFFFF', fontFace: 'Helvetica' });

const ssLaporBaru = getSS('user_laporan_baru.png');
if (ssLaporBaru) {
  slide6.addImage({ path: ssLaporBaru, x: 0.6, y: 1.3, w: 5.8, h: 3.5, rounding: true });
}
slide6.addText('Gambar 6.1: Form Pengajuan Setor Sampah', { x: 0.6, y: 4.9, w: 5.8, h: 0.3, fontSize: 10, align: 'center', color: COLOR_TEXT_MUTED });

const ssLaporList = getSS('user_laporan.png');
if (ssLaporList) {
  slide6.addImage({ path: ssLaporList, x: 6.8, y: 1.3, w: 5.8, h: 3.5, rounding: true });
}
slide6.addText('Gambar 6.2: Daftar Riwayat Laporan Sampah Saya', { x: 6.8, y: 4.9, w: 5.8, h: 0.3, fontSize: 10, align: 'center', color: COLOR_TEXT_MUTED });

// Steps
slide6.addShape(pptx.shapes.RECTANGLE, { x: 0.6, y: 5.3, w: 12.0, h: 1.4, fill: { color: COLOR_CARD_BG }, line: { color: COLOR_BORDER, width: 1 } });
slide6.addText([
  { text: 'Langkah Mengajukan Setor Sampah Daur Ulang:\n', options: { bold: true, color: COLOR_PRIMARY, fontSize: 12 } },
  { text: '1. Akses menu ', options: { fontSize: 10 } },
  { text: '"Setor Sampah" / "Laporan Baru".\n', options: { bold: true, fontSize: 10 } },
  { text: '2. Pilih Jenis Sampah (Plastik, Kertas, Logam, Kaca, dll.) dan Wilayah penjemputan/pengumpulan.\n', options: { fontSize: 10 } },
  { text: '3. Masukkan perkiraan Berat (Kg) dan Deskripsi tambahan. Upload foto bukti fisik sampah bila diperlukan.\n', options: { fontSize: 10 } },
  { text: '4. Klik "Kirim Laporan". Laporan akan langsung masuk ke antrean verifikasi Admin dengan status MENUNGGU.', options: { fontSize: 10 } }
], { x: 0.8, y: 5.4, w: 11.6, h: 1.2, fontFace: 'Helvetica' });


// -----------------------------------------------------------------------------
// SLIDE 7: ROLE USER - REWARDS & REDEEM POIN
// -----------------------------------------------------------------------------
let slide7 = pptx.addSlide();
slide7.background = { color: 'F9FAFB' };

slide7.addShape(pptx.shapes.RECTANGLE, { x: 0.6, y: 0.5, w: 6.0, h: 0.5, fill: { color: COLOR_PRIMARY } });
slide7.addText('02. PANDUAN USER: KATALOG & REDEEM REWARD', { x: 0.7, y: 0.5, w: 5.8, h: 0.5, fontSize: 14, bold: true, color: 'FFFFFF', fontFace: 'Helvetica' });

const ssRewards = getSS('user_rewards.png');
if (ssRewards) {
  slide7.addImage({ path: ssRewards, x: 0.6, y: 1.3, w: 5.8, h: 3.5, rounding: true });
}
slide7.addText('Gambar 7.1: Katalog Reward & Poin EcoPoint', { x: 0.6, y: 4.9, w: 5.8, h: 0.3, fontSize: 10, align: 'center', color: COLOR_TEXT_MUTED });

const ssRedeem = getSS('user_redeem.png');
if (ssRedeem) {
  slide7.addImage({ path: ssRedeem, x: 6.8, y: 1.3, w: 5.8, h: 3.5, rounding: true });
}
slide7.addText('Gambar 7.2: Riwayat Penukaran Reward (Redeem)', { x: 6.8, y: 4.9, w: 5.8, h: 0.3, fontSize: 10, align: 'center', color: COLOR_TEXT_MUTED });

slide7.addShape(pptx.shapes.RECTANGLE, { x: 0.6, y: 5.3, w: 12.0, h: 1.4, fill: { color: COLOR_CARD_BG }, line: { color: COLOR_BORDER, width: 1 } });
slide7.addText([
  { text: 'Langkah Penukaran EcoPoints dengan Reward:\n', options: { bold: true, color: COLOR_PRIMARY, fontSize: 12 } },
  { text: '1. Buka menu ', options: { fontSize: 10 } },
  { text: '"Katalog Reward" ', options: { bold: true, fontSize: 10 } },
  { text: 'untuk melihat daftar produk eco-friendly (Totebag, Mug, Notebook, dll).\n', options: { fontSize: 10 } },
  { text: '2. Pastikan jumlah saldo EcoPoints Anda mencukupi sesuai harga poin barang.\n', options: { fontSize: 10 } },
  { text: '3. Klik "Tukar Poin" dan konfirmasi penukaran. Poin akan otomatis terpotong dan riwayat klaim dapat dipantau di menu Penukaran.', options: { fontSize: 10 } }
], { x: 0.8, y: 5.4, w: 11.6, h: 1.2, fontFace: 'Helvetica' });


// -----------------------------------------------------------------------------
// SLIDE 8: ROLE USER - TRANSAKSI & PROFIL
// -----------------------------------------------------------------------------
let slide8 = pptx.addSlide();
slide8.background = { color: 'F9FAFB' };

slide8.addShape(pptx.shapes.RECTANGLE, { x: 0.6, y: 0.5, w: 6.0, h: 0.5, fill: { color: COLOR_PRIMARY } });
slide8.addText('02. PANDUAN USER: TRANSAKSI & PROFIL SAYA', { x: 0.7, y: 0.5, w: 5.8, h: 0.5, fontSize: 14, bold: true, color: 'FFFFFF', fontFace: 'Helvetica' });

const ssTrxUser = getSS('user_transaksi.png');
if (ssTrxUser) {
  slide8.addImage({ path: ssTrxUser, x: 0.6, y: 1.3, w: 5.8, h: 3.5, rounding: true });
}
slide8.addText('Gambar 8.1: Riwayat Transaksi Hasil Jual Sampah', { x: 0.6, y: 4.9, w: 5.8, h: 0.3, fontSize: 10, align: 'center', color: COLOR_TEXT_MUTED });

const ssProfUser = getSS('user_profile.png');
if (ssProfUser) {
  slide8.addImage({ path: ssProfUser, x: 6.8, y: 1.3, w: 5.8, h: 3.5, rounding: true });
}
slide8.addText('Gambar 8.2: Halaman Pengaturan Profil Akun', { x: 6.8, y: 4.9, w: 5.8, h: 0.3, fontSize: 10, align: 'center', color: COLOR_TEXT_MUTED });

slide8.addShape(pptx.shapes.RECTANGLE, { x: 0.6, y: 5.3, w: 12.0, h: 1.4, fill: { color: COLOR_CARD_BG }, line: { color: COLOR_BORDER, width: 1 } });
slide8.addText([
  { text: 'Fitur Transaksi & Manajemen Akun:\n', options: { bold: true, color: COLOR_PRIMARY, fontSize: 12 } },
  { text: '• ', options: { bold: true, color: COLOR_PRIMARY } },
  { text: 'Riwayat Transaksi: Memuat rincian nominal pembayaran tunai/transfer hasil penjualan sampah per laporan.\n', options: { fontSize: 10 } },
  { text: '• ', options: { bold: true, color: COLOR_PRIMARY } },
  { text: 'Profil Saya: Tempat memperbarui foto profil, nomor HP, email, alamat domisili, dan mengganti kata sandi secara aman.', options: { fontSize: 10 } }
], { x: 0.8, y: 5.4, w: 11.6, h: 1.2, fontFace: 'Helvetica' });


// -----------------------------------------------------------------------------
// SLIDE 9: ROLE ADMIN - DASHBOARD & VERIFIKASI
// -----------------------------------------------------------------------------
let slide9 = pptx.addSlide();
slide9.background = { color: 'F9FAFB' };

slide9.addShape(pptx.shapes.RECTANGLE, { x: 0.6, y: 0.5, w: 5.5, h: 0.5, fill: { color: COLOR_DARK } });
slide9.addText('03. PANDUAN ADMIN: DASHBOARD PANEL', { x: 0.7, y: 0.5, w: 5.3, h: 0.5, fontSize: 14, bold: true, color: 'FFFFFF', fontFace: 'Helvetica' });

const ssDashAdmin = getSS('dashboard_admin.png');
if (ssDashAdmin) {
  slide9.addImage({ path: ssDashAdmin, x: 0.6, y: 1.3, w: 7.2, h: 5.3, rounding: true });
}

slide9.addShape(pptx.shapes.RECTANGLE, { x: 8.1, y: 1.3, w: 4.5, h: 5.3, fill: { color: COLOR_CARD_BG }, line: { color: COLOR_BORDER, width: 1 } });
slide9.addText('Fungsi Kontrol Dashboard Admin', { x: 8.3, y: 1.5, w: 4.1, h: 0.4, fontSize: 15, bold: true, color: COLOR_DARK });

const adminDashFeatures = [
  { t: 'Metrik Total User & Sampah', d: 'Monitoring jumlah pengguna terdaftar dan akumulasi tonase sampah terkumpul.' },
  { t: 'Status Antrean Verifikasi', d: 'Panel pemantau laporan sampah yang membutuhkan persetujuan/proses segera.' },
  { t: 'Manajemen Master Data', d: 'Akses cepat kelola Jenis Sampah, Wilayah Layanan, Katalog Reward, & Akses User.' },
  { t: 'Audit Trail Activity', d: 'Riwayat aktivitas transaksi dan verifikasi laporan secara komprehensif.' }
];

adminDashFeatures.forEach((f, i) => {
  const fy = 2.1 + (i * 1.1);
  slide9.addShape(pptx.shapes.RECTANGLE, { x: 8.3, y: fy, w: 4.1, h: 0.95, fill: { color: COLOR_BG_LIGHT }, line: { color: COLOR_DARK, width: 1 } });
  slide9.addText(f.t, { x: 8.4, y: fy + 0.1, w: 3.9, h: 0.3, fontSize: 11, bold: true, color: COLOR_DARK });
  slide9.addText(f.d, { x: 8.4, y: fy + 0.4, w: 3.9, h: 0.5, fontSize: 9.5, color: COLOR_TEXT_DARK });
});


// -----------------------------------------------------------------------------
// SLIDE 10: ROLE ADMIN - KELOLA LAPORAN SAMPAH
// -----------------------------------------------------------------------------
let slide10 = pptx.addSlide();
slide10.background = { color: 'F9FAFB' };

slide10.addShape(pptx.shapes.RECTANGLE, { x: 0.6, y: 0.5, w: 6.0, h: 0.5, fill: { color: COLOR_DARK } });
slide10.addText('03. PANDUAN ADMIN: VERIFIKASI LAPORAN', { x: 0.7, y: 0.5, w: 5.8, h: 0.5, fontSize: 14, bold: true, color: 'FFFFFF', fontFace: 'Helvetica' });

const ssAdmLapor = getSS('admin_laporan.png');
if (ssAdmLapor) {
  slide10.addImage({ path: ssAdmLapor, x: 0.6, y: 1.3, w: 7.2, h: 5.3, rounding: true });
}

slide10.addShape(pptx.shapes.RECTANGLE, { x: 8.1, y: 1.3, w: 4.5, h: 5.3, fill: { color: COLOR_CARD_BG }, line: { color: COLOR_BORDER, width: 1 } });
slide10.addText('SOP Verifikasi Laporan Sampah', { x: 8.3, y: 1.5, w: 4.1, h: 0.4, fontSize: 15, bold: true, color: COLOR_DARK });

const sopSteps = [
  { step: '1. Cek Laporan Masuk', desc: 'Buka menu "Kelola Laporan". Filter berdasarkan status MENUNGGU.' },
  { step: '2. Validasi Fisik & Berat', desc: 'Periksa kesesuaian jenis sampah dan berat bersih (Kg) yang dilaporkan user.' },
  { step: '3. Update Status Laporan', desc: 'Ubah status menjadi DIPROSES saat diambil, dan SELESAI jika verifikasi tuntas.' },
  { step: '4. Generasi Otomatis Trx', desc: 'Sistem akan otomatis menerbitkan Transaksi & menambahkan EcoPoints ke User.' }
];

sopSteps.forEach((s, i) => {
  const sy = 2.1 + (i * 1.1);
  slide10.addShape(pptx.shapes.RECTANGLE, { x: 8.3, y: sy, w: 4.1, h: 0.95, fill: { color: COLOR_BG_LIGHT }, line: { color: COLOR_DARK, width: 1 } });
  slide10.addText(s.step, { x: 8.4, y: sy + 0.1, w: 3.9, h: 0.3, fontSize: 11, bold: true, color: COLOR_DARK });
  slide10.addText(s.desc, { x: 8.4, y: sy + 0.4, w: 3.9, h: 0.5, fontSize: 9.5, color: COLOR_TEXT_DARK });
});


// -----------------------------------------------------------------------------
// SLIDE 11: ROLE ADMIN - TRANSAKSI & REDEEM APPROVAL
// -----------------------------------------------------------------------------
let slide11 = pptx.addSlide();
slide11.background = { color: 'F9FAFB' };

slide11.addShape(pptx.shapes.RECTANGLE, { x: 0.6, y: 0.5, w: 6.5, h: 0.5, fill: { color: COLOR_DARK } });
slide11.addText('03. PANDUAN ADMIN: TRANSAKSI & REDEEM', { x: 0.7, y: 0.5, w: 6.3, h: 0.5, fontSize: 14, bold: true, color: 'FFFFFF', fontFace: 'Helvetica' });

const ssAdmTrx = getSS('admin_transaksi.png');
if (ssAdmTrx) {
  slide11.addImage({ path: ssAdmTrx, x: 0.6, y: 1.3, w: 5.8, h: 3.5, rounding: true });
}
slide11.addText('Gambar 11.1: Manajemen Transaksi Jual Beli Sampah', { x: 0.6, y: 4.9, w: 5.8, h: 0.3, fontSize: 10, align: 'center', color: COLOR_TEXT_MUTED });

const ssAdmRedeem = getSS('admin_redeem.png');
if (ssAdmRedeem) {
  slide11.addImage({ path: ssAdmRedeem, x: 6.8, y: 1.3, w: 5.8, h: 3.5, rounding: true });
}
slide11.addText('Gambar 11.2: Verifikasi & Approval Penukaran Reward', { x: 6.8, y: 4.9, w: 5.8, h: 0.3, fontSize: 10, align: 'center', color: COLOR_TEXT_MUTED });

slide11.addShape(pptx.shapes.RECTANGLE, { x: 0.6, y: 5.3, w: 12.0, h: 1.4, fill: { color: COLOR_CARD_BG }, line: { color: COLOR_BORDER, width: 1 } });
slide11.addText([
  { text: 'Tugas Operasional Admin Transaksi & Redeem:\n', options: { bold: true, color: COLOR_DARK, fontSize: 12 } },
  { text: '1. ', options: { bold: true, color: COLOR_DARK } },
  { text: 'Manajemen Transaksi: Memantau pembayaran tunai/transfer kepada user atas sampah yang disetorkan.\n', options: { fontSize: 10 } },
  { text: '2. ', options: { bold: true, color: COLOR_DARK } },
  { text: 'Approval Penukaran Reward: Memeriksa permohonan klaim barang, menyetujui (DIPROSES/SELESAI), dan mencetak Struk Pembayaran/Kwitansi pengeluaran stok reward.', options: { fontSize: 10 } }
], { x: 0.8, y: 5.4, w: 11.6, h: 1.2, fontFace: 'Helvetica' });


// -----------------------------------------------------------------------------
// SLIDE 12: ROLE ADMIN - MASTER DATA (JENIS SAMPAH & REWARDS)
// -----------------------------------------------------------------------------
let slide12 = pptx.addSlide();
slide12.background = { color: 'F9FAFB' };

slide12.addShape(pptx.shapes.RECTANGLE, { x: 0.6, y: 0.5, w: 6.5, h: 0.5, fill: { color: COLOR_DARK } });
slide12.addText('03. PANDUAN ADMIN: MASTER DATA (JENIS & REWARD)', { x: 0.7, y: 0.5, w: 6.3, h: 0.5, fontSize: 14, bold: true, color: 'FFFFFF', fontFace: 'Helvetica' });

const ssAdmJenis = getSS('admin_jenis_sampah.png');
if (ssAdmJenis) {
  slide12.addImage({ path: ssAdmJenis, x: 0.6, y: 1.3, w: 5.8, h: 3.5, rounding: true });
}
slide12.addText('Gambar 12.1: Kelola Jenis Sampah & Harga/Kg', { x: 0.6, y: 4.9, w: 5.8, h: 0.3, fontSize: 10, align: 'center', color: COLOR_TEXT_MUTED });

const ssAdmRew = getSS('admin_rewards.png');
if (ssAdmRew) {
  slide12.addImage({ path: ssAdmRew, x: 6.8, y: 1.3, w: 5.8, h: 3.5, rounding: true });
}
slide12.addText('Gambar 12.2: Kelola Katalog Barang Reward & Stok', { x: 6.8, y: 4.9, w: 5.8, h: 0.3, fontSize: 10, align: 'center', color: COLOR_TEXT_MUTED });

slide12.addShape(pptx.shapes.RECTANGLE, { x: 0.6, y: 5.3, w: 12.0, h: 1.4, fill: { color: COLOR_CARD_BG }, line: { color: COLOR_BORDER, width: 1 } });
slide12.addText([
  { text: 'Fitur Pengelolaan Master Data:\n', options: { bold: true, color: COLOR_DARK, fontSize: 12 } },
  { text: '• ', options: { bold: true, color: COLOR_DARK } },
  { text: 'Jenis Sampah: Tambah/edit nama sampah (Plastik, Kertas, Logam), deskripsi, dan penetapan harga beli per Kg.\n', options: { fontSize: 10 } },
  { text: '• ', options: { bold: true, color: COLOR_DARK } },
  { text: 'Katalog Reward: Kelola nama barang, poin yang dibutuhkan, stok barang, dan upload foto produk hadiah.', options: { fontSize: 10 } }
], { x: 0.8, y: 5.4, w: 11.6, h: 1.2, fontFace: 'Helvetica' });


// -----------------------------------------------------------------------------
// SLIDE 13: ROLE ADMIN - KELOLA WILAYAH & USERS
// -----------------------------------------------------------------------------
let slide13 = pptx.addSlide();
slide13.background = { color: 'F9FAFB' };

slide13.addShape(pptx.shapes.RECTANGLE, { x: 0.6, y: 0.5, w: 6.5, h: 0.5, fill: { color: COLOR_DARK } });
slide13.addText('03. PANDUAN ADMIN: KELOLA WILAYAH & USERS', { x: 0.7, y: 0.5, w: 6.3, h: 0.5, fontSize: 14, bold: true, color: 'FFFFFF', fontFace: 'Helvetica' });

const ssAdmWil = getSS('admin_wilayah.png');
if (ssAdmWil) {
  slide13.addImage({ path: ssAdmWil, x: 0.6, y: 1.3, w: 5.8, h: 3.5, rounding: true });
}
slide13.addText('Gambar 13.1: Kelola Master Data Wilayah & Kode Pos', { x: 0.6, y: 4.9, w: 5.8, h: 0.3, fontSize: 10, align: 'center', color: COLOR_TEXT_MUTED });

const ssAdmUsers = getSS('admin_users.png');
if (ssAdmUsers) {
  slide13.addImage({ path: ssAdmUsers, x: 6.8, y: 1.3, w: 5.8, h: 3.5, rounding: true });
}
slide13.addText('Gambar 13.2: Kelola Pengguna & Hak Akses Role', { x: 6.8, y: 4.9, w: 5.8, h: 0.3, fontSize: 10, align: 'center', color: COLOR_TEXT_MUTED });

slide13.addShape(pptx.shapes.RECTANGLE, { x: 0.6, y: 5.3, w: 12.0, h: 1.4, fill: { color: COLOR_CARD_BG }, line: { color: COLOR_BORDER, width: 1 } });
slide13.addText([
  { text: 'Fitur Operasional Wilayah & User Management:\n', options: { bold: true, color: COLOR_DARK, fontSize: 12 } },
  { text: '• ', options: { bold: true, color: COLOR_DARK } },
  { text: 'Master Wilayah: Mengatur area operasional pengumpulan sampah dan kode pos wilayah.\n', options: { fontSize: 10 } },
  { text: '• ', options: { bold: true, color: COLOR_DARK } },
  { text: 'Manajemen Users: Melihat data lengkap pengguna (NIK, Email, No HP), mengubah Role (USER/ADMIN), dan menghapus akun jika melanggar ketentuan.', options: { fontSize: 10 } }
], { x: 0.8, y: 5.4, w: 11.6, h: 1.2, fontFace: 'Helvetica' });


// -----------------------------------------------------------------------------
// SLIDE 14: DOKUMENTASI DATABASE - CONSTRAINTS
// -----------------------------------------------------------------------------
let slide14 = pptx.addSlide();
slide14.background = { color: 'F9FAFB' };

slide14.addShape(pptx.shapes.RECTANGLE, { x: 0.6, y: 0.5, w: 6.5, h: 0.5, fill: { color: COLOR_PRIMARY } });
slide14.addText('04. BASIS DATA: PENJELASAN CONSTRAINT', { x: 0.7, y: 0.5, w: 6.3, h: 0.5, fontSize: 14, bold: true, color: 'FFFFFF', fontFace: 'Helvetica' });

// Table of constraints explanation
const constraintRows = [
  [
    { text: 'Tipe Constraint', options: { bold: true, fill: COLOR_PRIMARY, color: 'FFFFFF' } },
    { text: 'Atribut dalam Schema Prisma', options: { bold: true, fill: COLOR_PRIMARY, color: 'FFFFFF' } },
    { text: 'Contoh Implementasi pada Tabel User / Schema', options: { bold: true, fill: COLOR_PRIMARY, color: 'FFFFFF' } },
    { text: 'Fungsi & Penjelasan Teknis', options: { bold: true, fill: COLOR_PRIMARY, color: 'FFFFFF' } }
  ],
  [
    { text: 'Primary Key (PK)', options: { bold: true } },
    { text: 'id String @id @default(uuid())' },
    { text: 'model User { id String @id ... }' },
    { text: 'Menjadi identitas unik utama setiap baris data (UUID) untuk menjamin integritas referensial.' }
  ],
  [
    { text: 'Unique Key', options: { bold: true } },
    { text: '@unique' },
    { text: 'nik String @unique\nemail String @unique\nnoHp String @unique' },
    { text: 'Mencegah terjadinya duplikasi data NIK, Email, atau No HP antar pengguna yang berbeda.' }
  ],
  [
    { text: 'NOT NULL', options: { bold: true } },
    { text: 'Tipe data tanpa penanda (?)' },
    { text: 'nama String\npassword String' },
    { text: 'Memastikan kolom wajib diisi saat insert data dan tidak boleh bernilai NULL pada basis data.' }
  ],
  [
    { text: 'Default Value', options: { bold: true } },
    { text: '@default(...)' },
    { text: 'role Role @default(USER)\ncreatedAt DateTime @default(now())' },
    { text: 'Memberikan nilai bawaan secara otomatis jika saat pembuatan record kolom tersebut tidak diisi.' }
  ]
];

slide14.addTable(constraintRows, { x: 0.6, y: 1.3, w: 12.0, colW: [1.8, 2.5, 3.2, 4.5], fontFace: 'Helvetica', fontSize: 10, border: { pt: 1, color: COLOR_BORDER } });

slide14.addShape(pptx.shapes.RECTANGLE, { x: 0.6, y: 5.3, w: 12.0, h: 1.4, fill: { color: COLOR_BG_LIGHT }, line: { color: COLOR_PRIMARY, width: 1 } });
slide14.addText([
  { text: 'Kesimpulan Constraint pada Aplikasi RecycleHub:\n', options: { bold: true, color: COLOR_PRIMARY, fontSize: 12 } },
  { text: 'Penerapan constraint di atas pada level schema Prisma (PostgreSQL) menjamin data valid, konsisten, aman dari duplikasi (seperti NIK ganda), dan mencegah kegagalan operasi akibat data kosong (null pointer pada atribut krusial seperti nama & password).', options: { fontSize: 10.5, color: COLOR_TEXT_DARK } }
], { x: 0.8, y: 5.4, w: 11.6, h: 1.2, fontFace: 'Helvetica' });


// -----------------------------------------------------------------------------
// SLIDE 15: DOKUMENTASI DATABASE - RDBMS RELASI
// -----------------------------------------------------------------------------
let slide15 = pptx.addSlide();
slide15.background = { color: 'F9FAFB' };

slide15.addShape(pptx.shapes.RECTANGLE, { x: 0.6, y: 0.5, w: 6.5, h: 0.5, fill: { color: COLOR_PRIMARY } });
slide15.addText('04. BASIS DATA: RELASI RDBMS (1:1, 1:N, N:M)', { x: 0.7, y: 0.5, w: 6.3, h: 0.5, fontSize: 14, bold: true, color: 'FFFFFF', fontFace: 'Helvetica' });

const rdbmsCards = [
  {
    type: '1 to 1 (One-to-One)',
    rel: 'User <---> Poin\natau LaporanSampah <---> Transaksi',
    code: 'model Poin {\n  userId String @unique\n  user User @relation(...)\n}',
    desc: 'Satu User tepat memiliki 1 record Poin akumulasi. Satu LaporanSampah tepat menghasilkan 1 Transaksi keuangan.'
  },
  {
    type: '1 to N (One-to-Many)',
    rel: 'User <---> LaporanSampah\natau JenisSampah <---> LaporanSampah',
    code: 'model LaporanSampah {\n  userId String\n  user User @relation(...)\n}',
    desc: 'Satu User dapat mengajukan banyak LaporanSampah daur ulang seiring waktu. Satu JenisSampah digunakan di banyak Laporan.'
  },
  {
    type: 'N to N (Many-to-Many)',
    rel: 'User <---> Wilayah\n(via tabel user_wilayah)',
    code: 'model user_wilayah {\n  userId String\n  wilayahId String\n  @@unique([userId, wilayahId])\n}',
    desc: 'Satu User (misal Admin/Petugas) dapat mengelola banyak Wilayah, dan satu Wilayah dapat dikelola oleh banyak User.'
  }
];

rdbmsCards.forEach((c, idx) => {
  const x = 0.6 + (idx * 4.1);
  slide15.addShape(pptx.shapes.RECTANGLE, { x, y: 1.3, w: 3.8, h: 5.3, fill: { color: COLOR_CARD_BG }, line: { color: COLOR_BORDER, width: 1 } });
  slide15.addShape(pptx.shapes.RECTANGLE, { x, y: 1.3, w: 3.8, h: 0.5, fill: { color: COLOR_PRIMARY } });
  slide15.addText(c.type, { x, y: 1.3, w: 3.8, h: 0.5, fontSize: 12, bold: true, color: 'FFFFFF', align: 'center' });

  slide15.addText('Relasi Entitas:', { x: x + 0.2, y: 2.0, w: 3.4, h: 0.3, fontSize: 11, bold: true, color: COLOR_DARK });
  slide15.addText(c.rel, { x: x + 0.2, y: 2.3, w: 3.4, h: 0.6, fontSize: 10, color: COLOR_PRIMARY, bold: true });

  slide15.addText('Potongan Code Schema:', { x: x + 0.2, y: 3.0, w: 3.4, h: 0.3, fontSize: 11, bold: true, color: COLOR_DARK });
  slide15.addShape(pptx.shapes.RECTANGLE, { x: x + 0.2, y: 3.3, w: 3.4, h: 1.4, fill: { color: COLOR_BG_LIGHT }, line: { color: COLOR_BORDER, width: 1 } });
  slide15.addText(c.code, { x: x + 0.3, y: 3.4, w: 3.2, h: 1.2, fontSize: 9, fontFace: 'Courier New', color: COLOR_TEXT_DARK });

  slide15.addText('Penjelasan:', { x: x + 0.2, y: 4.8, w: 3.4, h: 0.3, fontSize: 11, bold: true, color: COLOR_DARK });
  slide15.addText(c.desc, { x: x + 0.2, y: 5.1, w: 3.4, h: 1.3, fontSize: 9.5, color: COLOR_TEXT_MUTED });
});


// -----------------------------------------------------------------------------
// SLIDE 16: DOKUMENTASI DATABASE - NORMALISASI 1NF, 2NF, 3NF
// -----------------------------------------------------------------------------
let slide16 = pptx.addSlide();
slide16.background = { color: 'F9FAFB' };

slide16.addShape(pptx.shapes.RECTANGLE, { x: 0.6, y: 0.5, w: 6.5, h: 0.5, fill: { color: COLOR_PRIMARY } });
slide16.addText('04. BASIS DATA: NORMALISASI (1NF, 2NF, 3NF)', { x: 0.7, y: 0.5, w: 6.3, h: 0.5, fontSize: 14, bold: true, color: 'FFFFFF', fontFace: 'Helvetica' });

const normCards = [
  {
    step: '1NF (First Normal Form)',
    title: 'Atomisitas Data & Tanpa Repeating Group',
    desc: 'Semua kolom bernilai tunggal (atomic). Atribut multivalue seperti foto disebarkan ke tabel tersendiri (FotoSampah) yang terelasi via laporanId.',
    ex: 'Tabel FotoSampah dipisah dari LaporanSampah agar 1 laporan bisa punya N foto tanpa menyimpan string comma-separated.'
  },
  {
    step: '2NF (Second Normal Form)',
    title: 'Eliminasi Ketergantungan Parsial',
    desc: 'Memenuhi 1NF dan seluruh kolom non-key bergantung penuh pada Primary Key utama.',
    ex: 'Data hargaPerKg dan deskripsi sampah dipisah ke tabel JenisSampah & KategoriSampah agar tidak diulang-ulang di tabel LaporanSampah.'
  },
  {
    step: '3NF (Third Normal Form)',
    title: 'Eliminasi Ketergantungan Transitif',
    desc: 'Memenuhi 2NF dan tidak ada kolom non-key yang bergantung pada kolom non-key lainnya.',
    ex: 'Perhitungan Poin dipisah dari User ke tabel Poin. Data Wilayah dipisah dari LaporanSampah untuk menghindari redundansi nama wilayah.'
  }
];

normCards.forEach((n, idx) => {
  const x = 0.6 + (idx * 4.1);
  slide16.addShape(pptx.shapes.RECTANGLE, { x, y: 1.3, w: 3.8, h: 5.3, fill: { color: COLOR_CARD_BG }, line: { color: COLOR_BORDER, width: 1 } });
  slide16.addShape(pptx.shapes.RECTANGLE, { x, y: 1.3, w: 3.8, h: 0.5, fill: { color: COLOR_DARK } });
  slide16.addText(n.step, { x, y: 1.3, w: 3.8, h: 0.5, fontSize: 12, bold: true, color: 'FFFFFF', align: 'center' });

  slide16.addText(n.title, { x: x + 0.2, y: 2.0, w: 3.4, h: 0.5, fontSize: 12, bold: true, color: COLOR_PRIMARY });
  slide16.addText(n.desc, { x: x + 0.2, y: 2.6, w: 3.4, h: 1.5, fontSize: 10, color: COLOR_TEXT_DARK });

  slide16.addShape(pptx.shapes.RECTANGLE, { x: x + 0.2, y: 4.2, w: 3.4, h: 2.2, fill: { color: COLOR_BG_LIGHT }, line: { color: COLOR_PRIMARY, width: 1 } });
  slide16.addText('Studi Kasus RecycleHub:', { x: x + 0.3, y: 4.3, w: 3.2, h: 0.3, fontSize: 10.5, bold: true, color: COLOR_DARK });
  slide16.addText(n.ex, { x: x + 0.3, y: 4.7, w: 3.2, h: 1.6, fontSize: 9.5, color: COLOR_TEXT_DARK });
});


// -----------------------------------------------------------------------------
// SLIDE 17: CLOSING / THANK YOU SLIDE
// -----------------------------------------------------------------------------
let slide17 = pptx.addSlide();
slide17.background = { color: 'F9FAFB' };

slide17.addShape(pptx.shapes.RECTANGLE, { x: 1.0, y: 1.0, w: 11.3, h: 5.3, fill: { color: COLOR_CARD_BG }, line: { color: COLOR_BORDER, width: 1 } });
slide17.addShape(pptx.shapes.RECTANGLE, { x: 1.0, y: 1.0, w: 11.3, h: 0.2, fill: { color: COLOR_PRIMARY } });

slide17.addText('TERIMA KASIH', { x: 1.5, y: 1.8, w: 10.3, h: 0.8, fontSize: 40, bold: true, color: COLOR_PRIMARY, align: 'center', fontFace: 'Helvetica' });
slide17.addText('Dokumen User Manual & Panduan Basis Data Project RecycleHub 2026', { x: 1.5, y: 2.7, w: 10.3, h: 0.5, fontSize: 16, color: COLOR_DARK, align: 'center', fontFace: 'Helvetica' });

slide17.addShape(pptx.shapes.RECTANGLE, { x: 2.5, y: 3.5, w: 8.3, h: 2.0, fill: { color: COLOR_BG_LIGHT }, line: { color: COLOR_PRIMARY, width: 1 } });
slide17.addText([
  { text: 'Kontak & Informasi Pengembang:\n', options: { bold: true, color: COLOR_DARK, fontSize: 12 } },
  { text: '• Repository / Project Root: ', options: { bold: true } },
  { text: 'd:/recyclehub\n', options: { color: COLOR_PRIMARY } },
  { text: '• Status Sistem: ', options: { bold: true } },
  { text: 'Aktif & Terverifikasi (Next.js 16 + Prisma + PostgreSQL)\n', options: { color: COLOR_TEXT_DARK } },
  { text: '• Hak Cipta: ', options: { bold: true } },
  { text: '© 2026 RecycleHub Team. All rights reserved. 🌱', options: { color: COLOR_TEXT_DARK } }
], { x: 2.7, y: 3.7, w: 7.9, h: 1.6, fontFace: 'Helvetica', align: 'center' });


// Save Presentation
const targetPptPath = path.join(__dirname, '../User_Manual_RecycleHub.pptx');
pptx.writeFile({ fileName: targetPptPath })
  .then(() => {
    console.log('🎉 PowerPoint created successfully at:', targetPptPath);
  })
  .catch((err) => {
    console.error('❌ Error creating PowerPoint:', err);
  });
