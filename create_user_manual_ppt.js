/**
 * RecycleHub User Manual PPTX Generator
 * Style inspired by professional employee handbook design
 * Colors: Green (#16a34a, #15803d, #dcfce7) + White + Gray
 */

const PptxGenJS = require('pptxgenjs');
const path = require('path');
const fs = require('fs');

const pptx = new PptxGenJS();

// ─── GLOBAL SETTINGS ─────────────────────────────────────────────────────────
pptx.layout = 'LAYOUT_WIDE'; // 13.33 x 7.5 inches (widescreen 16:9)

// ─── COLOR PALETTE (matching website) ────────────────────────────────────────
const C = {
  green:       '16a34a',
  greenDark:   '15803d',
  greenLight:  'dcfce7',
  greenMid:    '86efac',
  emerald:     '059669',
  white:       'FFFFFF',
  gray50:      'f9fafb',
  gray100:     'f3f4f6',
  gray200:     'e5e7eb',
  gray500:     '6b7280',
  gray700:     '374151',
  gray900:     '111827',
  yellow:      'fef08a',
  yellowDark:  'ca8a04',
  blue:        'dbeafe',
  blueDark:    '1d4ed8',
  red:         'fee2e2',
  redDark:     'dc2626',
  accent:      '10b981',
  black:       '000000',
};

// ─── SCREENSHOT PATH HELPER ──────────────────────────────────────────────────
const SS = (name) => path.join(__dirname, 'public', 'screenshots', name);

// Check which screenshots exist
const ssExists = (name) => fs.existsSync(SS(name));

// ─── SLIDE FACTORY HELPERS ────────────────────────────────────────────────────

/**
 * Add a standard slide with sidebar accent bar (like the handbook style)
 */
function addSlide(opts = {}) {
  const slide = pptx.addSlide();

  // White background
  slide.background = { color: C.white };

  // Left green accent bar
  if (opts.accentBar !== false) {
    slide.addShape(pptx.ShapeType.rect, {
      x: 0, y: 0, w: 0.18, h: 7.5,
      fill: { color: C.green },
      line: { color: C.green },
    });
  }

  return slide;
}

/**
 * Add section title block (dark green box)
 */
function addSectionBox(slide, text, opts = {}) {
  const x = opts.x ?? 0.35;
  const y = opts.y ?? 0.2;
  const w = opts.w ?? 5.5;
  const h = opts.h ?? 0.55;

  slide.addShape(pptx.ShapeType.rect, {
    x, y, w, h,
    fill: { color: opts.color ?? C.green },
    line: { color: opts.color ?? C.green },
    rectRadius: 0.04,
  });

  slide.addText(text, {
    x, y, w, h,
    color: C.white,
    fontSize: opts.fontSize ?? 14,
    bold: true,
    align: 'center',
    valign: 'middle',
    fontFace: 'Calibri',
  });
}

/**
 * Add a numbered step box
 */
function addStep(slide, number, title, desc, x, y, w = 3.8, h = 1.1) {
  // Number circle
  slide.addShape(pptx.ShapeType.ellipse, {
    x: x, y: y, w: 0.42, h: 0.42,
    fill: { color: C.green },
    line: { color: C.green },
  });
  slide.addText(number.toString(), {
    x: x, y: y, w: 0.42, h: 0.42,
    color: C.white, fontSize: 13, bold: true,
    align: 'center', valign: 'middle', fontFace: 'Calibri',
  });

  // Title
  slide.addText(title, {
    x: x + 0.52, y: y, w: w - 0.52, h: 0.3,
    color: C.gray900, fontSize: 11, bold: true,
    fontFace: 'Calibri', valign: 'middle',
  });

  // Description
  slide.addText(desc, {
    x: x + 0.52, y: y + 0.28, w: w - 0.52, h: h - 0.28,
    color: C.gray700, fontSize: 9.5,
    fontFace: 'Calibri', valign: 'top',
    wrap: true,
  });
}

/**
 * Add info card
 */
function addInfoCard(slide, title, body, x, y, w = 3.5, h = 1.0, color = C.greenLight) {
  slide.addShape(pptx.ShapeType.rect, {
    x, y, w, h,
    fill: { color: color },
    line: { color: C.greenMid, pt: 1 },
    rectRadius: 0.05,
  });
  slide.addText(title, {
    x: x + 0.12, y: y + 0.1, w: w - 0.24, h: 0.28,
    color: C.greenDark, fontSize: 10, bold: true,
    fontFace: 'Calibri',
  });
  slide.addText(body, {
    x: x + 0.12, y: y + 0.34, w: w - 0.24, h: h - 0.44,
    color: C.gray700, fontSize: 9,
    fontFace: 'Calibri', wrap: true,
  });
}

/**
 * Add screenshot image (with fallback placeholder)
 */
function addScreenshot(slide, filename, x, y, w, h, caption = '') {
  const imgPath = SS(filename);
  if (fs.existsSync(imgPath)) {
    slide.addImage({ path: imgPath, x, y, w, h });
  } else {
    // Placeholder
    slide.addShape(pptx.ShapeType.rect, {
      x, y, w, h,
      fill: { color: C.gray100 },
      line: { color: C.gray200, pt: 1 },
    });
    slide.addText('[Screenshot: ' + filename + ']', {
      x, y, w, h,
      color: C.gray500, fontSize: 9, align: 'center', valign: 'middle',
      fontFace: 'Calibri',
    });
  }

  if (caption) {
    slide.addText(caption, {
      x, y: y + h + 0.05, w, h: 0.22,
      color: C.gray500, fontSize: 8, align: 'center',
      fontFace: 'Calibri', italic: true,
    });
  }
}

/**
 * Add a decorative dot pattern (like the handbook)
 */
function addDotPattern(slide, x, y, rows = 4, cols = 6) {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      slide.addShape(pptx.ShapeType.ellipse, {
        x: x + c * 0.15,
        y: y + r * 0.15,
        w: 0.07, h: 0.07,
        fill: { color: C.greenMid, alpha: 60 },
        line: { color: C.greenMid, alpha: 60 },
      });
    }
  }
}

/**
 * Add status badge
 */
function addBadge(slide, text, x, y, bgColor, textColor) {
  const w = 1.5;
  slide.addShape(pptx.ShapeType.roundRect, {
    x, y, w, h: 0.3,
    fill: { color: bgColor },
    line: { color: bgColor },
    rectRadius: 0.05,
  });
  slide.addText(text, {
    x, y, w, h: 0.3,
    color: textColor, fontSize: 9, bold: true,
    align: 'center', valign: 'middle', fontFace: 'Calibri',
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
//  SLIDE 1 – COVER
// ═══════════════════════════════════════════════════════════════════════════════
{
  const slide = pptx.addSlide();
  slide.background = { color: C.white };

  // Left dark green panel
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: 5.2, h: 7.5,
    fill: { color: C.greenDark },
    line: { color: C.greenDark },
  });

  // Dot decoration on left panel
  addDotPattern(slide, 0.3, 0.3, 5, 8);
  addDotPattern(slide, 0.3, 6.2, 3, 8);

  // Year badge (top right of panel)
  slide.addShape(pptx.ShapeType.rect, {
    x: 4.2, y: 0.25, w: 0.75, h: 1.2,
    fill: { color: C.green },
    line: { color: C.green },
  });
  slide.addText('2\n0\n2\n6', {
    x: 4.2, y: 0.25, w: 0.75, h: 1.2,
    color: C.white, fontSize: 11, bold: true,
    align: 'center', valign: 'middle', fontFace: 'Calibri',
  });

  // Logo / Icon area
  slide.addShape(pptx.ShapeType.ellipse, {
    x: 0.6, y: 1.1, w: 0.9, h: 0.9,
    fill: { color: C.green },
    line: { color: C.greenMid },
  });
  slide.addText('♻', {
    x: 0.6, y: 1.1, w: 0.9, h: 0.9,
    fontSize: 26, align: 'center', valign: 'middle',
    color: C.white,
  });

  // App name
  slide.addText('RecycleHub', {
    x: 0.3, y: 2.2, w: 4.5, h: 0.7,
    color: C.white, fontSize: 36, bold: true,
    fontFace: 'Calibri', align: 'left',
  });

  // Subtitle
  slide.addText('PANDUAN\nPENGGUNA', {
    x: 0.3, y: 2.95, w: 4.5, h: 0.9,
    color: C.greenMid, fontSize: 22, bold: true,
    fontFace: 'Calibri', align: 'left',
  });

  // Tagline
  slide.addText('Platform Pelaporan & Pengelolaan Sampah Digital', {
    x: 0.3, y: 3.9, w: 4.5, h: 0.4,
    color: C.white, fontSize: 11,
    fontFace: 'Calibri', align: 'left',
  });

  // Divider line
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.3, y: 4.35, w: 4.5, h: 0.04,
    fill: { color: C.green },
    line: { color: C.green },
  });

  // Role badges
  slide.addText('👤 Panduan untuk 2 Role:', {
    x: 0.3, y: 4.5, w: 4.5, h: 0.3,
    color: C.greenMid, fontSize: 10, bold: true,
    fontFace: 'Calibri',
  });
  slide.addText('• Pengguna (User)\n• Administrator (Admin)', {
    x: 0.4, y: 4.8, w: 4.5, h: 0.6,
    color: C.white, fontSize: 11,
    fontFace: 'Calibri',
  });

  // Bottom info
  slide.addText('Versi 1.0  •  Oktober 2026', {
    x: 0.3, y: 6.9, w: 4.5, h: 0.3,
    color: C.greenMid, fontSize: 9,
    fontFace: 'Calibri',
  });

  // Right panel – landing screenshot
  addScreenshot(slide, 'landing.png', 5.4, 0.3, 7.6, 5.0, 'Halaman Beranda RecycleHub');

  // Right panel info boxes
  slide.addShape(pptx.ShapeType.rect, {
    x: 5.4, y: 5.55, w: 3.6, h: 1.65,
    fill: { color: C.gray50 },
    line: { color: C.gray200 },
    rectRadius: 0.05,
  });
  slide.addText('Tentang RecycleHub', {
    x: 5.55, y: 5.65, w: 3.3, h: 0.28,
    color: C.green, fontSize: 10, bold: true, fontFace: 'Calibri',
  });
  slide.addText(
    'RecycleHub adalah platform web untuk membantu masyarakat melaporkan dan mengelola sampah secara digital. Pengguna dapat mengumpulkan poin dari setiap laporan sampah, lalu menukarnya dengan reward menarik.',
    {
      x: 5.55, y: 5.95, w: 3.3, h: 1.2,
      color: C.gray700, fontSize: 8.5, fontFace: 'Calibri', wrap: true,
    }
  );

  slide.addShape(pptx.ShapeType.rect, {
    x: 9.2, y: 5.55, w: 3.8, h: 1.65,
    fill: { color: C.greenLight },
    line: { color: C.greenMid },
    rectRadius: 0.05,
  });
  slide.addText('Fitur Utama', {
    x: 9.35, y: 5.65, w: 3.5, h: 0.28,
    color: C.greenDark, fontSize: 10, bold: true, fontFace: 'Calibri',
  });
  slide.addText(
    '✓ Laporan Sampah Digital\n✓ Sistem Poin & Reward\n✓ Monitoring Real-time\n✓ Manajemen Data Admin',
    {
      x: 9.35, y: 5.95, w: 3.5, h: 1.2,
      color: C.gray700, fontSize: 9, fontFace: 'Calibri',
    }
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  SLIDE 2 – TABLE OF CONTENTS
// ═══════════════════════════════════════════════════════════════════════════════
{
  const slide = addSlide();

  // Header
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.18, y: 0, w: 13.15, h: 1.1,
    fill: { color: C.gray50 },
    line: { color: C.gray200 },
  });

  slide.addText('DAFTAR ISI', {
    x: 0.35, y: 0.1, w: 6, h: 0.4,
    color: C.gray900, fontSize: 18, bold: true, fontFace: 'Calibri',
  });
  slide.addText('Panduan Pengguna RecycleHub', {
    x: 0.35, y: 0.55, w: 6, h: 0.35,
    color: C.gray500, fontSize: 11, fontFace: 'Calibri',
  });

  // Dot decoration
  addDotPattern(slide, 11.5, 0.15, 3, 5);

  // TOC Left Column – User Guide
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.35, y: 1.25, w: 6.1, h: 0.45,
    fill: { color: C.green },
    line: { color: C.green },
    rectRadius: 0.04,
  });
  slide.addText('👤  PANDUAN PENGGUNA (USER)', {
    x: 0.35, y: 1.25, w: 6.1, h: 0.45,
    color: C.white, fontSize: 12, bold: true,
    align: 'left', valign: 'middle', fontFace: 'Calibri',
    insetProps: { left: 0.15 },
  });

  const userItems = [
    { page: '3',  title: 'Pendaftaran Akun Baru' },
    { page: '4',  title: 'Login ke Sistem' },
    { page: '5',  title: 'Dashboard Pengguna' },
    { page: '6',  title: 'Membuat Laporan Sampah' },
    { page: '7',  title: 'Melihat & Mengelola Laporan' },
    { page: '8',  title: 'Sistem Poin Reward' },
    { page: '9',  title: 'Menukar Reward (Redeem)' },
    { page: '10', title: 'Riwayat Transaksi' },
    { page: '11', title: 'Edit Profil Pengguna' },
  ];

  userItems.forEach((item, i) => {
    const yPos = 1.82 + i * 0.52;
    const isEven = i % 2 === 0;

    slide.addShape(pptx.ShapeType.rect, {
      x: 0.35, y: yPos, w: 6.1, h: 0.44,
      fill: { color: isEven ? C.gray50 : C.white },
      line: { color: C.gray100 },
    });

    // Page number circle
    slide.addShape(pptx.ShapeType.ellipse, {
      x: 0.42, y: yPos + 0.07, w: 0.3, h: 0.3,
      fill: { color: C.greenLight },
      line: { color: C.greenMid },
    });
    slide.addText(item.page, {
      x: 0.42, y: yPos + 0.07, w: 0.3, h: 0.3,
      color: C.greenDark, fontSize: 8, bold: true,
      align: 'center', valign: 'middle', fontFace: 'Calibri',
    });

    slide.addText(item.title, {
      x: 0.82, y: yPos + 0.08, w: 5.5, h: 0.28,
      color: C.gray700, fontSize: 10, fontFace: 'Calibri',
    });

    // Dotted line
    slide.addShape(pptx.ShapeType.line, {
      x: 0.82, y: yPos + 0.36, w: 5.5, h: 0,
      line: { color: C.gray200, dashType: 'dot', pt: 0.5 },
    });
  });

  // TOC Right Column – Admin Guide
  slide.addShape(pptx.ShapeType.rect, {
    x: 6.85, y: 1.25, w: 6.1, h: 0.45,
    fill: { color: C.greenDark },
    line: { color: C.greenDark },
    rectRadius: 0.04,
  });
  slide.addText('🛡️  PANDUAN ADMINISTRATOR (ADMIN)', {
    x: 6.85, y: 1.25, w: 6.1, h: 0.45,
    color: C.white, fontSize: 12, bold: true,
    align: 'left', valign: 'middle', fontFace: 'Calibri',
    insetProps: { left: 0.15 },
  });

  const adminItems = [
    { page: '13', title: 'Login Admin' },
    { page: '14', title: 'Dashboard Admin' },
    { page: '15', title: 'Monitoring Laporan Sampah' },
    { page: '16', title: 'Manajemen Pengguna' },
    { page: '17', title: 'Manajemen Jenis Sampah' },
    { page: '18', title: 'Manajemen Wilayah' },
    { page: '19', title: 'Manajemen Reward' },
    { page: '20', title: 'Kelola Penukaran Reward' },
    { page: '21', title: 'Manajemen Transaksi' },
  ];

  adminItems.forEach((item, i) => {
    const yPos = 1.82 + i * 0.52;
    const isEven = i % 2 === 0;

    slide.addShape(pptx.ShapeType.rect, {
      x: 6.85, y: yPos, w: 6.1, h: 0.44,
      fill: { color: isEven ? C.gray50 : C.white },
      line: { color: C.gray100 },
    });

    slide.addShape(pptx.ShapeType.ellipse, {
      x: 6.92, y: yPos + 0.07, w: 0.3, h: 0.3,
      fill: { color: C.greenLight },
      line: { color: C.greenMid },
    });
    slide.addText(item.page, {
      x: 6.92, y: yPos + 0.07, w: 0.3, h: 0.3,
      color: C.greenDark, fontSize: 8, bold: true,
      align: 'center', valign: 'middle', fontFace: 'Calibri',
    });

    slide.addText(item.title, {
      x: 7.32, y: yPos + 0.08, w: 5.5, h: 0.28,
      color: C.gray700, fontSize: 10, fontFace: 'Calibri',
    });

    slide.addShape(pptx.ShapeType.line, {
      x: 7.32, y: yPos + 0.36, w: 5.5, h: 0,
      line: { color: C.gray200, dashType: 'dot', pt: 0.5 },
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
//  SLIDE 3 – USER SECTION DIVIDER
// ═══════════════════════════════════════════════════════════════════════════════
{
  const slide = pptx.addSlide();
  slide.background = { color: C.green };

  addDotPattern(slide, 0.3, 0.3, 7, 10);
  addDotPattern(slide, 10.5, 5.0, 5, 8);

  slide.addShape(pptx.ShapeType.rect, {
    x: 1.5, y: 1.8, w: 10.0, h: 4.0,
    fill: { color: C.greenDark, alpha: 80 },
    line: { color: C.greenMid },
    rectRadius: 0.08,
  });

  slide.addText('👤', {
    x: 1.5, y: 2.0, w: 10.0, h: 1.0,
    fontSize: 48, align: 'center',
  });

  slide.addText('PANDUAN PENGGUNA', {
    x: 1.5, y: 3.1, w: 10.0, h: 0.8,
    color: C.white, fontSize: 36, bold: true,
    align: 'center', fontFace: 'Calibri',
  });

  slide.addText('USER MANUAL', {
    x: 1.5, y: 3.85, w: 10.0, h: 0.5,
    color: C.greenMid, fontSize: 18,
    align: 'center', fontFace: 'Calibri',
  });

  slide.addText('Panduan lengkap untuk pengguna dalam melapor sampah,\nmengumpulkan poin, dan menukarkan reward.', {
    x: 1.5, y: 4.45, w: 10.0, h: 0.8,
    color: C.white, fontSize: 11,
    align: 'center', fontFace: 'Calibri',
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
//  SLIDE 4 – USER: PENDAFTARAN AKUN
// ═══════════════════════════════════════════════════════════════════════════════
{
  const slide = addSlide();

  addSectionBox(slide, '01  |  PENDAFTARAN AKUN BARU', { w: 6 });

  slide.addText('Buat akun RecycleHub untuk mulai melaporkan sampah dan mengumpulkan poin.', {
    x: 0.35, y: 0.82, w: 6, h: 0.35,
    color: C.gray500, fontSize: 10, fontFace: 'Calibri',
  });

  // Steps
  addStep(slide, 1, 'Buka Halaman Registrasi',
    'Akses website RecycleHub lalu klik tombol "Daftar" atau langsung menuju /register.',
    0.35, 1.3, 5.8, 1.0);

  addStep(slide, 2, 'Isi Data Diri',
    'Lengkapi formulir: Nama Lengkap, Email aktif, No. HP, dan Password (min. 6 karakter).',
    0.35, 2.38, 5.8, 1.0);

  addStep(slide, 3, 'Pilih Wilayah',
    'Pilih wilayah tempat tinggal Anda dari dropdown yang tersedia.',
    0.35, 3.45, 5.8, 0.9);

  addStep(slide, 4, 'Upload Foto Profil (Opsional)',
    'Unggah foto profil Anda. Format JPG/PNG, maksimal 5MB.',
    0.35, 4.4, 5.8, 0.9);

  addStep(slide, 5, 'Klik Daftar',
    'Tekan tombol "Daftar" berwarna hijau. Jika berhasil, Anda akan diarahkan ke halaman login.',
    0.35, 5.35, 5.8, 1.0);

  // Screenshot
  addScreenshot(slide, 'register.png', 6.5, 0.25, 6.6, 6.8, 'Halaman Registrasi');

  // Footer tip
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.35, y: 6.5, w: 5.8, h: 0.65,
    fill: { color: C.greenLight },
    line: { color: C.greenMid },
    rectRadius: 0.04,
  });
  slide.addText('💡 Tips: Pastikan email yang Anda masukkan aktif. Email dan No. HP tidak dapat digunakan lebih dari satu kali.', {
    x: 0.5, y: 6.55, w: 5.5, h: 0.55,
    color: C.greenDark, fontSize: 9, fontFace: 'Calibri', wrap: true,
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
//  SLIDE 5 – USER: LOGIN
// ═══════════════════════════════════════════════════════════════════════════════
{
  const slide = addSlide();

  addSectionBox(slide, '02  |  LOGIN KE SISTEM');

  slide.addText('Masuk ke akun RecycleHub menggunakan email dan password yang telah terdaftar.', {
    x: 0.35, y: 0.82, w: 6, h: 0.35,
    color: C.gray500, fontSize: 10, fontFace: 'Calibri',
  });

  addStep(slide, 1, 'Buka Halaman Login',
    'Akses /login di browser atau klik tombol "Login" dari halaman beranda.',
    0.35, 1.3, 5.8, 0.95);

  addStep(slide, 2, 'Masukkan Email & Password',
    'Isi email dan password yang Anda daftarkan. Centang "Ingat Saya" agar email tersimpan.',
    0.35, 2.32, 5.8, 1.0);

  addStep(slide, 3, 'Klik Masuk',
    'Tekan tombol "Masuk". Sistem akan mengarahkan Anda ke dashboard sesuai role (User/Admin).',
    0.35, 3.4, 5.8, 0.95);

  // Info boxes
  addInfoCard(slide, '🔐 Lupa Password?',
    'Saat ini belum tersedia fitur reset password. Hubungi administrator untuk bantuan.',
    0.35, 4.55, 5.8, 0.85, 'fef9c3');

  // Status indicators
  slide.addText('Status Akun:', {
    x: 0.35, y: 5.55, w: 5.8, h: 0.3,
    color: C.gray700, fontSize: 10, bold: true, fontFace: 'Calibri',
  });

  addBadge(slide, '✓ Login Berhasil → Dashboard', 0.35, 5.9, C.greenLight, C.greenDark);
  addBadge(slide, '✗ Email/Password Salah → Error', 0.35 + 1.65, 5.9, 'fee2e2', C.redDark);

  slide.addText('Pengguna biasa → Dashboard User\nAdmin → Dashboard Admin', {
    x: 0.35, y: 6.3, w: 5.8, h: 0.5,
    color: C.gray500, fontSize: 9, fontFace: 'Calibri',
  });

  // Screenshot
  addScreenshot(slide, 'login.png', 6.5, 0.25, 6.6, 6.8, 'Halaman Login RecycleHub');
}

// ═══════════════════════════════════════════════════════════════════════════════
//  SLIDE 6 – USER: DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
{
  const slide = addSlide();

  addSectionBox(slide, '03  |  DASHBOARD PENGGUNA', { w: 7 });

  // Screenshot
  addScreenshot(slide, 'dashboard_user.png', 0.35, 0.9, 7.5, 4.5, 'Dashboard Utama Pengguna');

  // Info cards on right
  slide.addText('Komponen Dashboard', {
    x: 8.1, y: 0.85, w: 5.0, h: 0.35,
    color: C.gray900, fontSize: 12, bold: true, fontFace: 'Calibri',
  });

  const dashInfo = [
    { title: '🟢 Poin Reward Saya', desc: 'Menampilkan jumlah poin aktif yang dapat ditukar dengan reward.' },
    { title: '🟡 Total Poin Dikumpulkan', desc: 'Total akumulasi poin dari seluruh laporan sampah yang selesai.' },
    { title: '📊 Statistik Laporan', desc: 'Ringkasan laporan: Total, Menunggu, Diproses, Selesai, Ditolak.' },
    { title: '🔥 Jenis Sampah Populer', desc: 'Daftar jenis sampah yang paling sering dilaporkan.' },
    { title: '📋 Tabel Laporan', desc: 'Daftar semua laporan Anda dengan status dan aksi tersedia.' },
  ];

  dashInfo.forEach((item, i) => {
    addInfoCard(slide, item.title, item.desc, 8.1, 1.3 + i * 1.0, 5.0, 0.85);
  });

  // Sidebar navigation info
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.35, y: 5.55, w: 7.5, h: 1.6,
    fill: { color: C.gray50 },
    line: { color: C.gray200 },
    rectRadius: 0.05,
  });

  slide.addText('Menu Navigasi (Sidebar):', {
    x: 0.5, y: 5.65, w: 7.2, h: 0.3,
    color: C.gray700, fontSize: 10, bold: true, fontFace: 'Calibri',
  });

  const navItems = [
    '📋 Laporan Saya', '📦 Reward', '🎁 Redeem Saya', '💰 Transaksi', '👤 Profil'
  ];
  navItems.forEach((nav, i) => {
    slide.addShape(pptx.ShapeType.rect, {
      x: 0.5 + i * 1.44, y: 6.0, w: 1.35, h: 0.4,
      fill: { color: C.greenLight },
      line: { color: C.greenMid },
      rectRadius: 0.04,
    });
    slide.addText(nav, {
      x: 0.5 + i * 1.44, y: 6.0, w: 1.35, h: 0.4,
      color: C.greenDark, fontSize: 8.5, bold: true,
      align: 'center', valign: 'middle', fontFace: 'Calibri',
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
//  SLIDE 7 – USER: MEMBUAT LAPORAN BARU
// ═══════════════════════════════════════════════════════════════════════════════
{
  const slide = addSlide();

  addSectionBox(slide, '04  |  MEMBUAT LAPORAN SAMPAH BARU', { w: 7.5 });

  slide.addText('Laporkan sampah Anda untuk mendapatkan poin reward.', {
    x: 0.35, y: 0.82, w: 7.5, h: 0.3,
    color: C.gray500, fontSize: 10, fontFace: 'Calibri',
  });

  // Steps left column
  addStep(slide, 1, 'Klik "Buat Laporan Baru"',
    'Dari halaman Laporan Saya, klik tombol hijau "+ Buat Laporan Baru" di pojok kanan atas.',
    0.35, 1.2, 5.7, 0.9);

  addStep(slide, 2, 'Pilih Jenis Sampah',
    'Pilih jenis sampah dari dropdown (misal: Plastik, Kertas, Logam, Kaca, dsb).',
    0.35, 2.15, 5.7, 0.9);

  addStep(slide, 3, 'Pilih Wilayah Pengambilan',
    'Pilih wilayah tempat pengambilan sampah. Pastikan sesuai dengan lokasi Anda.',
    0.35, 3.1, 5.7, 0.9);

  addStep(slide, 4, 'Masukkan Berat Sampah',
    'Isi estimasi berat sampah dalam satuan kilogram (kg). Contoh: 2.5',
    0.35, 4.05, 5.7, 0.9);

  addStep(slide, 5, 'Upload Foto Sampah',
    'Upload minimal 1 foto sampah. Format JPG/PNG/WebP, maks. 5MB per file.',
    0.35, 5.0, 5.7, 0.9);

  addStep(slide, 6, 'Tambah Deskripsi (Opsional)',
    'Tambahkan keterangan tambahan jika diperlukan, lalu klik "Kirim Laporan".',
    0.35, 5.95, 5.7, 0.9);

  // Screenshot
  addScreenshot(slide, 'user_laporan_baru.png', 6.3, 0.9, 6.8, 5.5, 'Formulir Laporan Baru');

  // Poin info
  slide.addShape(pptx.ShapeType.rect, {
    x: 6.3, y: 6.55, w: 6.8, h: 0.65,
    fill: { color: C.greenLight },
    line: { color: C.greenMid },
    rectRadius: 0.04,
  });
  slide.addText('💰 Poin otomatis dihitung berdasarkan: Berat Sampah (kg) × Harga per Kg Jenis Sampah. Poin diberikan saat laporan berstatus SELESAI.', {
    x: 6.45, y: 6.6, w: 6.5, h: 0.55,
    color: C.greenDark, fontSize: 9, fontFace: 'Calibri', wrap: true,
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
//  SLIDE 8 – USER: MELIHAT & MENGELOLA LAPORAN
// ═══════════════════════════════════════════════════════════════════════════════
{
  const slide = addSlide();

  addSectionBox(slide, '05  |  MELIHAT & MENGELOLA LAPORAN', { w: 7 });

  // Screenshot
  addScreenshot(slide, 'user_laporan.png', 0.35, 0.85, 7.5, 4.6, 'Halaman Laporan Saya');

  // Right side content
  slide.addText('Status Laporan', {
    x: 8.1, y: 0.85, w: 5.0, h: 0.35,
    color: C.gray900, fontSize: 12, bold: true, fontFace: 'Calibri',
  });

  const statuses = [
    { label: '⏰ MENUNGGU', desc: 'Laporan baru, belum diproses admin', bg: C.yellow, text: C.yellowDark },
    { label: '🔄 DIPROSES', desc: 'Admin sedang memverifikasi laporan', bg: C.blue, text: C.blueDark },
    { label: '✅ SELESAI', desc: 'Laporan selesai, poin telah diberikan', bg: C.greenLight, text: C.greenDark },
    { label: '❌ DITOLAK', desc: 'Laporan ditolak, tidak ada poin', bg: C.red, text: C.redDark },
  ];

  statuses.forEach((s, i) => {
    slide.addShape(pptx.ShapeType.rect, {
      x: 8.1, y: 1.3 + i * 0.82, w: 5.0, h: 0.7,
      fill: { color: s.bg },
      line: { color: s.bg },
      rectRadius: 0.04,
    });
    slide.addText(s.label, {
      x: 8.22, y: 1.33 + i * 0.82, w: 4.8, h: 0.28,
      color: s.text, fontSize: 10, bold: true, fontFace: 'Calibri',
    });
    slide.addText(s.desc, {
      x: 8.22, y: 1.6 + i * 0.82, w: 4.8, h: 0.25,
      color: s.text, fontSize: 9, fontFace: 'Calibri',
    });
  });

  // Aksi
  slide.addText('Aksi Tersedia:', {
    x: 8.1, y: 4.62, w: 5.0, h: 0.3,
    color: C.gray900, fontSize: 11, bold: true, fontFace: 'Calibri',
  });

  const actions = [
    { icon: '👁️', label: 'Lihat Detail', desc: 'Tampilkan detail lengkap laporan' },
    { icon: '✏️', label: 'Edit Laporan', desc: 'Edit laporan (hanya status MENUNGGU)' },
    { icon: '🗑️', label: 'Hapus Laporan', desc: 'Hapus laporan (hanya status MENUNGGU)' },
  ];

  actions.forEach((a, i) => {
    slide.addShape(pptx.ShapeType.rect, {
      x: 8.1 + i * 1.7, y: 5.0, w: 1.6, h: 0.8,
      fill: { color: C.gray50 },
      line: { color: C.gray200 },
      rectRadius: 0.04,
    });
    slide.addText(a.icon + '\n' + a.label, {
      x: 8.1 + i * 1.7, y: 5.05, w: 1.6, h: 0.45,
      color: C.green, fontSize: 9, bold: true,
      align: 'center', fontFace: 'Calibri',
    });
    slide.addText(a.desc, {
      x: 8.1 + i * 1.7, y: 5.5, w: 1.6, h: 0.28,
      color: C.gray500, fontSize: 7.5, align: 'center',
      fontFace: 'Calibri', wrap: true,
    });
  });

  // Search tip
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.35, y: 5.6, w: 7.5, h: 0.65,
    fill: { color: C.gray50 },
    line: { color: C.gray200 },
    rectRadius: 0.04,
  });
  slide.addText('🔍 Filter & Pencarian: Gunakan kolom pencarian untuk mencari berdasarkan jenis sampah, wilayah, atau deskripsi. Filter berdasarkan status tersedia via dropdown. Urutkan berdasarkan Terbaru atau Terlama.', {
    x: 0.5, y: 5.65, w: 7.2, h: 0.55,
    color: C.gray700, fontSize: 9, fontFace: 'Calibri', wrap: true,
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
//  SLIDE 9 – USER: SISTEM POIN
// ═══════════════════════════════════════════════════════════════════════════════
{
  const slide = addSlide();

  addSectionBox(slide, '06  |  SISTEM POIN REWARD', { w: 6 });

  slide.addText('RecycleHub menggunakan sistem poin untuk memberikan insentif kepada pengguna yang aktif melapor sampah.', {
    x: 0.35, y: 0.82, w: 12.8, h: 0.35,
    color: C.gray500, fontSize: 10, fontFace: 'Calibri',
  });

  // Poin calculation flow
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.35, y: 1.28, w: 12.8, h: 1.8,
    fill: { color: C.greenLight },
    line: { color: C.greenMid },
    rectRadius: 0.06,
  });

  slide.addText('💰 Cara Perhitungan Poin', {
    x: 0.5, y: 1.38, w: 12.5, h: 0.35,
    color: C.greenDark, fontSize: 12, bold: true, fontFace: 'Calibri',
  });

  // Formula boxes
  const formulaItems = [
    { label: 'Berat Sampah', val: 'X kg', w: 2.2 },
    { label: '×', val: '', w: 0.4, isOp: true },
    { label: 'Harga per Kg', val: 'Rp/kg (sesuai jenis)', w: 2.8 },
    { label: '=', val: '', w: 0.4, isOp: true },
    { label: 'Total Poin', val: 'Poin ditambahkan', w: 2.2 },
  ];

  let fx = 0.35;
  formulaItems.forEach(item => {
    if (item.isOp) {
      slide.addText(item.label, {
        x: fx + 0.05, y: 1.85, w: item.w, h: 0.7,
        color: C.greenDark, fontSize: 22, bold: true,
        align: 'center', valign: 'middle', fontFace: 'Calibri',
      });
    } else {
      slide.addShape(pptx.ShapeType.rect, {
        x: fx, y: 1.82, w: item.w, h: 0.8,
        fill: { color: C.green },
        line: { color: C.greenDark },
        rectRadius: 0.04,
      });
      slide.addText(item.label + '\n' + item.val, {
        x: fx, y: 1.82, w: item.w, h: 0.8,
        color: C.white, fontSize: 9, bold: true,
        align: 'center', valign: 'middle', fontFace: 'Calibri',
      });
    }
    fx += item.w + 0.08;
  });

  slide.addText('⚠️  Poin diberikan secara otomatis saat Admin mengubah status laporan menjadi "SELESAI"', {
    x: 0.5, y: 2.72, w: 12.5, h: 0.28,
    color: C.greenDark, fontSize: 9, fontFace: 'Calibri', italic: true,
  });

  // Poin cards
  const pointCards = [
    {
      title: '📈 Poin Aktif',
      desc: 'Poin yang tersedia untuk ditukar dengan reward. Berkurang setiap kali Anda melakukan penukaran (redeem).',
      color: C.greenLight,
    },
    {
      title: '🏆 Total Poin Dikumpulkan',
      desc: 'Akumulasi total poin dari semua laporan selesai sepanjang waktu. Tidak berkurang meski redeem.',
      color: 'fef9c3',
    },
    {
      title: '🎁 Cara Mendapatkan Poin',
      desc: '1. Buat laporan sampah\n2. Admin memverifikasi\n3. Status → SELESAI\n4. Poin otomatis masuk',
      color: 'dbeafe',
    },
    {
      title: '💸 Cara Menggunakan Poin',
      desc: '1. Buka menu Reward\n2. Pilih reward yang diinginkan\n3. Pastikan poin cukup\n4. Klik Tukar (Redeem)',
      color: 'fce7f3',
    },
  ];

  pointCards.forEach((card, i) => {
    const x = 0.35 + (i % 2) * 6.55;
    const y = 3.25 + Math.floor(i / 2) * 1.9;
    addInfoCard(slide, card.title, card.desc, x, y, 6.2, 1.65, card.color);
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
//  SLIDE 10 – USER: REWARD & REDEEM
// ═══════════════════════════════════════════════════════════════════════════════
{
  const slide = addSlide();

  addSectionBox(slide, '07  |  MENUKAR REWARD (REDEEM)', { w: 7 });

  // Left steps
  slide.addText('Langkah Menukar Poin dengan Reward:', {
    x: 0.35, y: 0.88, w: 5.8, h: 0.3,
    color: C.gray700, fontSize: 10, bold: true, fontFace: 'Calibri',
  });

  addStep(slide, 1, 'Buka Menu "Reward"',
    'Klik menu "Reward" di sidebar kiri. Halaman akan menampilkan daftar reward yang tersedia.',
    0.35, 1.28, 5.8, 0.95);

  addStep(slide, 2, 'Cek Saldo Poin Anda',
    'Perhatikan poin aktif yang ditampilkan di bagian atas halaman reward.',
    0.35, 2.28, 5.8, 0.85);

  addStep(slide, 3, 'Pilih Reward',
    'Browse daftar reward. Perhatikan jumlah poin yang dibutuhkan dan stok yang tersedia.',
    0.35, 3.17, 5.8, 0.9);

  addStep(slide, 4, 'Klik "Tukar"',
    'Jika poin mencukupi, klik tombol "Tukar". Konfirmasi pada dialog yang muncul.',
    0.35, 4.12, 5.8, 0.9);

  addStep(slide, 5, 'Cek Status Penukaran',
    'Buka menu "Redeem Saya" untuk melihat status penukaran (PENDING / SELESAI).',
    0.35, 5.06, 5.8, 0.9);

  // Warning box
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.35, y: 6.1, w: 5.8, h: 0.65,
    fill: { color: 'fff7ed' },
    line: { color: 'fed7aa' },
    rectRadius: 0.04,
  });
  slide.addText('⚠️ Penukaran tidak dapat dibatalkan. Pastikan reward yang dipilih sudah benar sebelum konfirmasi.', {
    x: 0.5, y: 6.15, w: 5.5, h: 0.55,
    color: 'c2410c', fontSize: 9, fontFace: 'Calibri', wrap: true,
  });

  // Screenshots
  addScreenshot(slide, 'user_rewards.png', 6.3, 0.85, 3.6, 3.3, 'Halaman Reward');
  addScreenshot(slide, 'user_redeem.png', 10.1, 0.85, 3.0, 3.3, 'Halaman Redeem Saya');

  // Redeem status info
  slide.addShape(pptx.ShapeType.rect, {
    x: 6.3, y: 4.35, w: 6.8, h: 2.9,
    fill: { color: C.gray50 },
    line: { color: C.gray200 },
    rectRadius: 0.05,
  });

  slide.addText('Status Penukaran Reward:', {
    x: 6.45, y: 4.45, w: 6.5, h: 0.3,
    color: C.gray700, fontSize: 10, bold: true, fontFace: 'Calibri',
  });

  const redeemStatuses = [
    { label: '⏳ PENDING', desc: 'Penukaran sedang menunggu konfirmasi dari Admin. Stok reward telah berkurang.', bg: 'fef9c3', text: C.yellowDark },
    { label: '✅ SELESAI', desc: 'Penukaran telah dikonfirmasi Admin. Reward siap diklaim/diterima.', bg: C.greenLight, text: C.greenDark },
  ];

  redeemStatuses.forEach((s, i) => {
    slide.addShape(pptx.ShapeType.rect, {
      x: 6.45, y: 4.85 + i * 1.05, w: 6.5, h: 0.85,
      fill: { color: s.bg },
      line: { color: s.bg },
      rectRadius: 0.04,
    });
    slide.addText(s.label, {
      x: 6.6, y: 4.9 + i * 1.05, w: 6.2, h: 0.28,
      color: s.text, fontSize: 10, bold: true, fontFace: 'Calibri',
    });
    slide.addText(s.desc, {
      x: 6.6, y: 5.18 + i * 1.05, w: 6.2, h: 0.5,
      color: s.text, fontSize: 9, fontFace: 'Calibri', wrap: true,
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
//  SLIDE 11 – USER: TRANSAKSI
// ═══════════════════════════════════════════════════════════════════════════════
{
  const slide = addSlide();

  addSectionBox(slide, '08  |  RIWAYAT TRANSAKSI', { w: 6 });

  slide.addText('Lihat riwayat transaksi keuangan dari setiap laporan sampah yang telah selesai.', {
    x: 0.35, y: 0.82, w: 12.8, h: 0.3,
    color: C.gray500, fontSize: 10, fontFace: 'Calibri',
  });

  // Screenshot
  addScreenshot(slide, 'user_transaksi.png', 0.35, 1.2, 7.5, 5.0, 'Halaman Riwayat Transaksi');

  // Right content
  slide.addText('Apa itu Transaksi?', {
    x: 8.1, y: 1.2, w: 5.0, h: 0.35,
    color: C.gray900, fontSize: 12, bold: true, fontFace: 'Calibri',
  });

  slide.addText(
    'Setiap laporan yang berstatus SELESAI akan menghasilkan transaksi. Transaksi mencatat nilai rupiah dari sampah yang Anda setorkan berdasarkan berat × harga per kg jenis sampah.',
    {
      x: 8.1, y: 1.62, w: 5.0, h: 1.0,
      color: C.gray700, fontSize: 10, fontFace: 'Calibri', wrap: true,
    }
  );

  const txInfo = [
    { title: '📄 Jenis Sampah', desc: 'Jenis sampah yang dilaporkan dalam transaksi' },
    { title: '⚖️ Berat (kg)', desc: 'Berat sampah dalam kilogram' },
    { title: '💵 Total Nilai', desc: 'Total nilai rupiah = Berat × Harga per Kg' },
    { title: '📅 Tanggal', desc: 'Tanggal transaksi selesai diproses' },
  ];

  txInfo.forEach((item, i) => {
    addInfoCard(slide, item.title, item.desc, 8.1, 2.75 + i * 0.95, 5.0, 0.8);
  });

  // Bottom note
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.35, y: 6.3, w: 12.8, h: 0.85,
    fill: { color: C.greenLight },
    line: { color: C.greenMid },
    rectRadius: 0.04,
  });
  slide.addText('ℹ️ Catatan: Transaksi bersifat informasi saja dan menampilkan nilai estimasi sampah. Pembayaran/pelunasan dilakukan melalui mekanisme di luar platform (tunai atau transfer sesuai kesepakatan dengan admin/petugas).', {
    x: 0.5, y: 6.35, w: 12.5, h: 0.75,
    color: C.greenDark, fontSize: 9, fontFace: 'Calibri', wrap: true,
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
//  SLIDE 12 – USER: PROFIL
// ═══════════════════════════════════════════════════════════════════════════════
{
  const slide = addSlide();

  addSectionBox(slide, '09  |  EDIT PROFIL PENGGUNA', { w: 6 });

  // Screenshot
  addScreenshot(slide, 'user_profile.png', 6.3, 0.25, 6.8, 6.8, 'Halaman Profil Pengguna');

  slide.addText('Kelola informasi akun Anda dari halaman profil.', {
    x: 0.35, y: 0.82, w: 5.8, h: 0.3,
    color: C.gray500, fontSize: 10, fontFace: 'Calibri',
  });

  addStep(slide, 1, 'Buka Menu Profil',
    'Klik menu "Profil" di sidebar kiri.',
    0.35, 1.25, 5.7, 0.85);

  addStep(slide, 2, 'Update Foto Profil',
    'Klik pada foto profil atau tombol upload untuk mengganti foto. Format JPG/PNG, maks 5MB.',
    0.35, 2.18, 5.7, 0.95);

  addStep(slide, 3, 'Edit Data Diri',
    'Ubah nama lengkap atau nomor HP Anda sesuai kebutuhan.',
    0.35, 3.2, 5.7, 0.85);

  addStep(slide, 4, 'Ganti Password',
    'Masukkan password lama, password baru, dan konfirmasi password baru.',
    0.35, 4.12, 5.7, 0.85);

  addStep(slide, 5, 'Simpan Perubahan',
    'Klik tombol "Simpan" berwarna hijau untuk menyimpan semua perubahan.',
    0.35, 5.04, 5.7, 0.85);

  slide.addShape(pptx.ShapeType.rect, {
    x: 0.35, y: 6.02, w: 5.7, h: 0.7,
    fill: { color: 'fef9c3' },
    line: { color: 'fde68a' },
    rectRadius: 0.04,
  });
  slide.addText('⚠️ Email tidak dapat diubah setelah pendaftaran. Hubungi Admin jika perlu perubahan email.', {
    x: 0.5, y: 6.07, w: 5.4, h: 0.6,
    color: C.yellowDark, fontSize: 9, fontFace: 'Calibri', wrap: true,
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
//  SLIDE 13 – ADMIN SECTION DIVIDER
// ═══════════════════════════════════════════════════════════════════════════════
{
  const slide = pptx.addSlide();
  slide.background = { color: C.greenDark };

  addDotPattern(slide, 0.3, 0.3, 7, 10);
  addDotPattern(slide, 10.5, 5.0, 5, 8);

  slide.addShape(pptx.ShapeType.rect, {
    x: 1.5, y: 1.8, w: 10.0, h: 4.0,
    fill: { color: C.green, alpha: 50 },
    line: { color: C.greenMid },
    rectRadius: 0.08,
  });

  slide.addText('🛡️', {
    x: 1.5, y: 2.0, w: 10.0, h: 1.0,
    fontSize: 48, align: 'center',
  });

  slide.addText('PANDUAN ADMINISTRATOR', {
    x: 1.5, y: 3.1, w: 10.0, h: 0.8,
    color: C.white, fontSize: 34, bold: true,
    align: 'center', fontFace: 'Calibri',
  });

  slide.addText('ADMIN MANUAL', {
    x: 1.5, y: 3.85, w: 10.0, h: 0.5,
    color: C.greenMid, fontSize: 18,
    align: 'center', fontFace: 'Calibri',
  });

  slide.addText('Panduan lengkap untuk administrator dalam mengelola laporan,\npengguna, reward, transaksi, dan data master aplikasi.', {
    x: 1.5, y: 4.45, w: 10.0, h: 0.8,
    color: C.white, fontSize: 11,
    align: 'center', fontFace: 'Calibri',
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
//  SLIDE 14 – ADMIN: DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
{
  const slide = addSlide();

  addSectionBox(slide, '10  |  DASHBOARD ADMINISTRATOR', { w: 7 });

  // Screenshot
  addScreenshot(slide, 'dashboard_admin.png', 0.35, 0.85, 7.5, 4.5, 'Dashboard Admin RecycleHub');

  // Right content
  slide.addText('Menu Admin', {
    x: 8.1, y: 0.85, w: 5.0, h: 0.35,
    color: C.gray900, fontSize: 12, bold: true, fontFace: 'Calibri',
  });

  const adminMenus = [
    { icon: '📋', label: 'Laporan', desc: 'Monitor & kelola semua laporan sampah dari pengguna' },
    { icon: '👥', label: 'Pengguna', desc: 'Manajemen akun pengguna terdaftar' },
    { icon: '🗑️', label: 'Jenis Sampah', desc: 'Tambah/edit/hapus kategori jenis sampah & harga' },
    { icon: '🗺️', label: 'Wilayah', desc: 'Kelola daftar wilayah layanan' },
    { icon: '🎁', label: 'Reward', desc: 'Tambah/edit/hapus reward yang dapat ditukar poin' },
    { icon: '🛍️', label: 'Penukaran', desc: 'Monitor & konfirmasi penukaran reward pengguna' },
    { icon: '💰', label: 'Transaksi', desc: 'Lihat semua transaksi yang telah terjadi' },
  ];

  adminMenus.forEach((m, i) => {
    addInfoCard(slide, m.icon + ' ' + m.label, m.desc, 8.1, 1.3 + i * 0.83, 5.0, 0.7);
  });

  // Stats summary bottom
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.35, y: 5.55, w: 7.5, h: 1.6,
    fill: { color: C.gray50 },
    line: { color: C.gray200 },
    rectRadius: 0.05,
  });

  slide.addText('Statistik Cepat di Dashboard Admin:', {
    x: 0.5, y: 5.65, w: 7.2, h: 0.3,
    color: C.gray700, fontSize: 10, bold: true, fontFace: 'Calibri',
  });

  const quickStats = ['Total Laporan', 'Menunggu', 'Diproses', 'Selesai', 'Ditolak', 'Total Berat (kg)', 'Penukaran Pending'];
  quickStats.forEach((s, i) => {
    const x = 0.5 + (i % 4) * 1.82;
    const y = 6.05 + Math.floor(i / 4) * 0.55;
    slide.addShape(pptx.ShapeType.rect, {
      x, y, w: 1.72, h: 0.42,
      fill: { color: C.greenLight },
      line: { color: C.greenMid },
      rectRadius: 0.03,
    });
    slide.addText(s, {
      x, y, w: 1.72, h: 0.42,
      color: C.greenDark, fontSize: 8.5, bold: true,
      align: 'center', valign: 'middle', fontFace: 'Calibri',
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
//  SLIDE 15 – ADMIN: MONITORING LAPORAN
// ═══════════════════════════════════════════════════════════════════════════════
{
  const slide = addSlide();

  addSectionBox(slide, '11  |  MONITORING LAPORAN SAMPAH', { w: 7.5 });

  slide.addText('Admin dapat memantau, memverifikasi, dan mengubah status semua laporan dari pengguna.', {
    x: 0.35, y: 0.82, w: 12.8, h: 0.3,
    color: C.gray500, fontSize: 10, fontFace: 'Calibri',
  });

  // Screenshot
  addScreenshot(slide, 'admin_laporan.png', 0.35, 1.2, 8.2, 4.5, 'Halaman Monitoring Laporan Admin');

  // Right steps
  slide.addText('Cara Kelola Laporan:', {
    x: 8.8, y: 1.2, w: 4.3, h: 0.35,
    color: C.gray900, fontSize: 11, bold: true, fontFace: 'Calibri',
  });

  addStep(slide, 1, 'Cari & Filter Laporan',
    'Gunakan kolom pencarian dan filter status untuk menemukan laporan spesifik.',
    8.8, 1.65, 4.3, 1.0);

  addStep(slide, 2, 'Lihat Detail Laporan',
    'Klik ikon 👁️ untuk melihat detail: foto, info pengguna, lokasi, berat.',
    8.8, 2.72, 4.3, 0.95);

  addStep(slide, 3, 'Ubah Status Laporan',
    'Di kolom Status, gunakan dropdown untuk mengubah: MENUNGGU → DIPROSES → SELESAI / DITOLAK.',
    8.8, 3.73, 4.3, 1.1);

  addStep(slide, 4, 'Hapus Laporan',
    'Klik ikon 🗑️ untuk menghapus laporan yang tidak valid (perlu konfirmasi).',
    8.8, 4.9, 4.3, 0.95);

  // Status flow
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.35, y: 5.9, w: 12.8, h: 1.35,
    fill: { color: C.gray50 },
    line: { color: C.gray200 },
    rectRadius: 0.05,
  });
  slide.addText('Alur Status Laporan:', {
    x: 0.5, y: 5.98, w: 12.5, h: 0.28,
    color: C.gray700, fontSize: 10, bold: true, fontFace: 'Calibri',
  });

  const statusFlow = [
    { label: 'MENUNGGU', color: C.yellow, textColor: C.yellowDark },
    { label: '→', color: C.white, textColor: C.gray500, isArrow: true },
    { label: 'DIPROSES', color: C.blue, textColor: C.blueDark },
    { label: '→', color: C.white, textColor: C.gray500, isArrow: true },
    { label: 'SELESAI ✅', color: C.greenLight, textColor: C.greenDark },
  ];

  let sfx = 0.5;
  statusFlow.forEach(sf => {
    if (sf.isArrow) {
      slide.addText(sf.label, {
        x: sfx, y: 6.3, w: 0.4, h: 0.55,
        color: sf.textColor, fontSize: 20, bold: true,
        align: 'center', valign: 'middle', fontFace: 'Calibri',
      });
      sfx += 0.42;
    } else {
      slide.addShape(pptx.ShapeType.rect, {
        x: sfx, y: 6.3, w: 2.2, h: 0.55,
        fill: { color: sf.color },
        line: { color: sf.color },
        rectRadius: 0.04,
      });
      slide.addText(sf.label, {
        x: sfx, y: 6.3, w: 2.2, h: 0.55,
        color: sf.textColor, fontSize: 10, bold: true,
        align: 'center', valign: 'middle', fontFace: 'Calibri',
      });
      sfx += 2.28;
    }
  });

  slide.addText('atau', { x: sfx, y: 6.3, w: 0.5, h: 0.55, color: C.gray500, fontSize: 9, align: 'center', valign: 'middle', fontFace: 'Calibri' });
  sfx += 0.52;
  slide.addShape(pptx.ShapeType.rect, { x: sfx, y: 6.3, w: 2.2, h: 0.55, fill: { color: C.red }, line: { color: C.red }, rectRadius: 0.04 });
  slide.addText('DITOLAK ❌', { x: sfx, y: 6.3, w: 2.2, h: 0.55, color: C.redDark, fontSize: 10, bold: true, align: 'center', valign: 'middle', fontFace: 'Calibri' });

  slide.addText('⚡ Saat status menjadi SELESAI, poin otomatis diberikan ke pengguna!', {
    x: 7.0, y: 6.45, w: 6.0, h: 0.4,
    color: C.greenDark, fontSize: 9.5, bold: true, fontFace: 'Calibri',
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
//  SLIDE 16 – ADMIN: MANAJEMEN PENGGUNA
// ═══════════════════════════════════════════════════════════════════════════════
{
  const slide = addSlide();

  addSectionBox(slide, '12  |  MANAJEMEN PENGGUNA', { w: 6 });

  // Screenshot
  addScreenshot(slide, 'admin_users.png', 6.3, 0.25, 6.8, 4.5, 'Halaman Manajemen Pengguna');

  slide.addText('Kelola semua akun pengguna yang terdaftar di sistem RecycleHub.', {
    x: 0.35, y: 0.82, w: 5.8, h: 0.3,
    color: C.gray500, fontSize: 10, fontFace: 'Calibri',
  });

  addStep(slide, 1, 'Lihat Daftar Pengguna',
    'Buka menu "Pengguna". Tabel menampilkan nama, email, no. HP, wilayah, role, dan tanggal daftar.',
    0.35, 1.25, 5.8, 1.0);

  addStep(slide, 2, 'Cari Pengguna',
    'Gunakan kolom pencarian untuk mencari pengguna berdasarkan nama atau email.',
    0.35, 2.32, 5.8, 0.9);

  addStep(slide, 3, 'Lihat Detail Pengguna',
    'Klik tombol detail untuk melihat info lengkap pengguna termasuk riwayat laporan & poin.',
    0.35, 3.28, 5.8, 0.9);

  addStep(slide, 4, 'Edit / Hapus Pengguna',
    'Admin dapat mengubah data pengguna atau menghapus akun yang tidak aktif.',
    0.35, 4.24, 5.8, 0.9);

  addInfoCard(slide, '⚠️ Perhatian',
    'Hapus pengguna akan menghapus seluruh data terkait (laporan, transaksi, poin). Lakukan dengan hati-hati.',
    0.35, 5.28, 5.8, 0.85, 'fee2e2');

  // Bottom screenshots row
  addScreenshot(slide, 'admin_users.png', 6.3, 4.9, 6.8, 2.3, 'Detail Pengguna');
}

// ═══════════════════════════════════════════════════════════════════════════════
//  SLIDE 17 – ADMIN: JENIS SAMPAH
// ═══════════════════════════════════════════════════════════════════════════════
{
  const slide = addSlide();

  addSectionBox(slide, '13  |  MANAJEMEN JENIS SAMPAH', { w: 7 });

  slide.addText('Kelola kategori jenis sampah beserta harga per kilogram untuk sistem perhitungan poin.', {
    x: 0.35, y: 0.82, w: 12.8, h: 0.3,
    color: C.gray500, fontSize: 10, fontFace: 'Calibri',
  });

  // Screenshot
  addScreenshot(slide, 'admin_jenis_sampah.png', 0.35, 1.2, 7.5, 5.0, 'Halaman Manajemen Jenis Sampah');

  // Right content
  slide.addText('Cara Mengelola Jenis Sampah:', {
    x: 8.1, y: 1.2, w: 5.0, h: 0.35,
    color: C.gray900, fontSize: 11, bold: true, fontFace: 'Calibri',
  });

  addStep(slide, 1, 'Tambah Jenis Sampah',
    'Klik tombol "+ Tambah Jenis Sampah". Isi nama jenis dan harga per kg lalu simpan.',
    8.1, 1.65, 5.0, 1.0);

  addStep(slide, 2, 'Edit Jenis Sampah',
    'Klik ikon ✏️ pada baris yang ingin diubah. Update nama atau harga lalu simpan.',
    8.1, 2.73, 5.0, 0.95);

  addStep(slide, 3, 'Hapus Jenis Sampah',
    'Klik ikon 🗑️. Jenis sampah yang sudah dipakai pada laporan tidak dapat dihapus.',
    8.1, 3.75, 5.0, 0.95);

  addInfoCard(slide, '💡 Tips Harga',
    'Harga per kg menentukan nilai poin yang diperoleh pengguna. Semakin tinggi harga, semakin banyak poin yang didapat pengguna untuk setiap kg sampah yang dilaporkan.',
    8.1, 4.85, 5.0, 1.1, C.greenLight);

  // Bottom note
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.35, y: 6.35, w: 7.5, h: 0.8,
    fill: { color: C.gray50 },
    line: { color: C.gray200 },
    rectRadius: 0.04,
  });
  slide.addText('📝 Contoh Jenis Sampah:\n• Plastik (PET) — Rp 2.000/kg  •  Kertas/Kardus — Rp 1.500/kg  •  Logam/Besi — Rp 3.000/kg  •  Kaca — Rp 1.000/kg  •  Organik — Rp 500/kg', {
    x: 0.5, y: 6.4, w: 7.2, h: 0.7,
    color: C.gray700, fontSize: 9, fontFace: 'Calibri', wrap: true,
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
//  SLIDE 18 – ADMIN: WILAYAH
// ═══════════════════════════════════════════════════════════════════════════════
{
  const slide = addSlide();

  addSectionBox(slide, '14  |  MANAJEMEN WILAYAH', { w: 6.5 });

  // Screenshot
  addScreenshot(slide, 'admin_wilayah.png', 6.3, 0.25, 6.8, 5.5, 'Halaman Manajemen Wilayah');

  slide.addText('Kelola daftar wilayah layanan pengambilan sampah yang tersedia di sistem.', {
    x: 0.35, y: 0.82, w: 5.8, h: 0.3,
    color: C.gray500, fontSize: 10, fontFace: 'Calibri',
  });

  addStep(slide, 1, 'Lihat Daftar Wilayah',
    'Buka menu "Wilayah". Tabel menampilkan semua wilayah yang aktif di sistem.',
    0.35, 1.25, 5.7, 0.9);

  addStep(slide, 2, 'Tambah Wilayah Baru',
    'Klik "+ Tambah Wilayah", masukkan nama wilayah, lalu klik Simpan.',
    0.35, 2.22, 5.7, 0.9);

  addStep(slide, 3, 'Edit Wilayah',
    'Klik ✏️ pada wilayah yang ingin diubah namanya.',
    0.35, 3.19, 5.7, 0.85);

  addStep(slide, 4, 'Hapus Wilayah',
    'Klik 🗑️ untuk menghapus wilayah. Wilayah yang masih digunakan laporan tidak dapat dihapus.',
    0.35, 4.1, 5.7, 0.95);

  addInfoCard(slide, '🗺️ Pentingnya Wilayah',
    'Wilayah menentukan cakupan layanan pengambilan sampah. Pengguna akan memilih wilayah saat membuat laporan. Pastikan semua wilayah yang dilayani sudah terdaftar.',
    0.35, 5.18, 5.7, 1.0, C.greenLight);

  slide.addShape(pptx.ShapeType.rect, {
    x: 0.35, y: 6.3, w: 5.7, h: 0.65,
    fill: { color: 'fef9c3' },
    line: { color: 'fde68a' },
    rectRadius: 0.04,
  });
  slide.addText('⚠️ Hapus wilayah akan mempengaruhi laporan yang menggunakan wilayah tersebut. Lakukan dengan hati-hati.', {
    x: 0.5, y: 6.35, w: 5.4, h: 0.55,
    color: C.yellowDark, fontSize: 9, fontFace: 'Calibri', wrap: true,
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
//  SLIDE 19 – ADMIN: REWARD
// ═══════════════════════════════════════════════════════════════════════════════
{
  const slide = addSlide();

  addSectionBox(slide, '15  |  MANAJEMEN REWARD', { w: 6.5 });

  slide.addText('Tambahkan dan kelola reward yang dapat ditukar pengguna menggunakan poin mereka.', {
    x: 0.35, y: 0.82, w: 12.8, h: 0.3,
    color: C.gray500, fontSize: 10, fontFace: 'Calibri',
  });

  // Screenshot
  addScreenshot(slide, 'admin_rewards.png', 0.35, 1.2, 7.5, 4.5, 'Halaman Manajemen Reward');

  slide.addText('Mengelola Data Reward:', {
    x: 8.1, y: 1.2, w: 5.0, h: 0.35,
    color: C.gray900, fontSize: 11, bold: true, fontFace: 'Calibri',
  });

  addStep(slide, 1, 'Tambah Reward Baru',
    'Klik "+ Tambah Reward". Isi nama, deskripsi, jumlah poin, stok, dan upload gambar reward.',
    8.1, 1.65, 5.0, 1.1);

  addStep(slide, 2, 'Edit Reward',
    'Klik ✏️ untuk mengubah detail reward yang sudah ada termasuk stok dan nilai poin.',
    8.1, 2.82, 5.0, 0.95);

  addStep(slide, 3, 'Hapus Reward',
    'Klik 🗑️ untuk menghapus reward. Reward yang sudah pernah di-redeem tidak dapat dihapus.',
    8.1, 3.84, 5.0, 0.95);

  addInfoCard(slide, '📦 Field Reward',
    '• Nama Reward\n• Deskripsi\n• Jumlah Poin (harga tukar)\n• Stok tersedia\n• Gambar reward (opsional)',
    8.1, 4.9, 5.0, 1.1, C.greenLight);

  // Bottom tips
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.35, y: 5.9, w: 7.5, h: 1.25,
    fill: { color: C.gray50 },
    line: { color: C.gray200 },
    rectRadius: 0.04,
  });
  slide.addText('💡 Tips Manajemen Reward:', {
    x: 0.5, y: 5.98, w: 7.2, h: 0.28,
    color: C.gray700, fontSize: 10, bold: true, fontFace: 'Calibri',
  });
  slide.addText('• Sesuaikan nilai poin dengan harga/nilai nyata reward\n• Update stok secara berkala setelah konfirmasi penukaran\n• Tambahkan gambar menarik agar pengguna lebih tertarik menukar poin', {
    x: 0.5, y: 6.28, w: 7.2, h: 0.8,
    color: C.gray700, fontSize: 9, fontFace: 'Calibri', wrap: true,
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
//  SLIDE 20 – ADMIN: PENUKARAN REWARD
// ═══════════════════════════════════════════════════════════════════════════════
{
  const slide = addSlide();

  addSectionBox(slide, '16  |  KELOLA PENUKARAN REWARD (REDEEM)', { w: 8 });

  // Screenshot
  addScreenshot(slide, 'admin_redeem.png', 6.3, 0.25, 6.8, 4.5, 'Halaman Kelola Penukaran');

  slide.addText('Monitor dan konfirmasi semua permintaan penukaran reward dari pengguna.', {
    x: 0.35, y: 0.82, w: 5.8, h: 0.3,
    color: C.gray500, fontSize: 10, fontFace: 'Calibri',
  });

  addStep(slide, 1, 'Lihat Daftar Penukaran',
    'Buka menu "Penukaran". Tabel menampilkan semua permintaan redeem dengan status PENDING/SELESAI.',
    0.35, 1.25, 5.7, 1.0);

  addStep(slide, 2, 'Lihat Detail Penukaran',
    'Klik ikon detail untuk melihat informasi lengkap: nama reward, pengguna, tanggal, dan poin yang digunakan.',
    0.35, 2.32, 5.7, 1.0);

  addStep(slide, 3, 'Konfirmasi Penukaran',
    'Ubah status dari PENDING menjadi SELESAI setelah reward telah diberikan kepada pengguna.',
    0.35, 3.38, 5.7, 1.0);

  addStep(slide, 4, 'Cetak Bukti Penukaran',
    'Klik tombol cetak/print untuk mencetak bukti penukaran reward sebagai dokumentasi.',
    0.35, 4.44, 5.7, 0.9);

  // Alur penukaran
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.35, y: 5.5, w: 5.7, h: 1.7,
    fill: { color: C.gray50 },
    line: { color: C.gray200 },
    rectRadius: 0.05,
  });
  slide.addText('Alur Penukaran Reward:', {
    x: 0.5, y: 5.6, w: 5.4, h: 0.3,
    color: C.gray700, fontSize: 10, bold: true, fontFace: 'Calibri',
  });

  const redeemFlow = [
    { label: 'User Klik\nTukar', bg: C.blue, text: C.blueDark },
    { label: '→', bg: C.white, text: C.gray500, arrow: true },
    { label: 'Status\nPENDING', bg: C.yellow, text: C.yellowDark },
    { label: '→', bg: C.white, text: C.gray500, arrow: true },
    { label: 'Admin\nKonfirmasi', bg: 'e0e7ff', text: '3730a3' },
    { label: '→', bg: C.white, text: C.gray500, arrow: true },
    { label: 'Status\nSELESAI ✅', bg: C.greenLight, text: C.greenDark },
  ];

  let rfx = 0.5;
  redeemFlow.forEach(rf => {
    if (rf.arrow) {
      slide.addText('→', { x: rfx, y: 6.0, w: 0.35, h: 0.65, color: rf.text, fontSize: 18, bold: true, align: 'center', valign: 'middle', fontFace: 'Calibri' });
      rfx += 0.37;
    } else {
      slide.addShape(pptx.ShapeType.rect, { x: rfx, y: 6.0, w: 1.2, h: 0.65, fill: { color: rf.bg }, line: { color: rf.bg }, rectRadius: 0.04 });
      slide.addText(rf.label, { x: rfx, y: 6.0, w: 1.2, h: 0.65, color: rf.text, fontSize: 9, bold: true, align: 'center', valign: 'middle', fontFace: 'Calibri' });
      rfx += 1.28;
    }
  });

  // Right bottom
  addInfoCard(slide, '📄 Bukti Penukaran',
    'Admin dapat mencetak receipt/bukti penukaran untuk dokumentasi. Tersedia di halaman detail penukaran.',
    6.3, 4.9, 6.8, 0.9, C.greenLight);

  slide.addShape(pptx.ShapeType.rect, {
    x: 6.3, y: 5.9, w: 6.8, h: 1.3,
    fill: { color: 'fef9c3' },
    line: { color: 'fde68a' },
    rectRadius: 0.04,
  });
  slide.addText('⚠️ Penting:', {
    x: 6.45, y: 5.98, w: 6.5, h: 0.28,
    color: C.yellowDark, fontSize: 10, bold: true, fontFace: 'Calibri',
  });
  slide.addText('Pastikan reward sudah benar-benar diberikan kepada pengguna sebelum mengubah status menjadi SELESAI. Perubahan status tidak dapat dibatalkan.', {
    x: 6.45, y: 6.28, w: 6.5, h: 0.85,
    color: C.yellowDark, fontSize: 9, fontFace: 'Calibri', wrap: true,
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
//  SLIDE 21 – ADMIN: TRANSAKSI
// ═══════════════════════════════════════════════════════════════════════════════
{
  const slide = addSlide();

  addSectionBox(slide, '17  |  MANAJEMEN TRANSAKSI', { w: 6.5 });

  slide.addText('Monitor semua transaksi nilai sampah dari laporan yang telah selesai diproses.', {
    x: 0.35, y: 0.82, w: 12.8, h: 0.3,
    color: C.gray500, fontSize: 10, fontFace: 'Calibri',
  });

  // Screenshot
  addScreenshot(slide, 'admin_transaksi.png', 0.35, 1.2, 7.5, 4.5, 'Halaman Manajemen Transaksi');

  slide.addText('Info Transaksi:', {
    x: 8.1, y: 1.2, w: 5.0, h: 0.35,
    color: C.gray900, fontSize: 11, bold: true, fontFace: 'Calibri',
  });

  const txAdminInfo = [
    { title: '📋 ID Laporan', desc: 'Referensi ke laporan sampah yang menghasilkan transaksi ini.' },
    { title: '👤 Nama Pengguna', desc: 'Pengguna yang melaporkan sampah.' },
    { title: '🗑️ Jenis Sampah', desc: 'Kategori sampah yang dilaporkan.' },
    { title: '⚖️ Berat (kg)', desc: 'Berat aktual sampah yang disetorkan.' },
    { title: '💵 Total Nilai (Rp)', desc: 'Nilai rupiah = Berat × Harga per Kg jenis sampah.' },
    { title: '📅 Tanggal', desc: 'Waktu transaksi tercatat (saat status laporan → SELESAI).' },
  ];

  txAdminInfo.forEach((item, i) => {
    addInfoCard(slide, item.title, item.desc, 8.1, 1.65 + i * 0.85, 5.0, 0.72);
  });

  // Bottom summary
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.35, y: 5.88, w: 12.8, h: 1.32,
    fill: { color: C.greenLight },
    line: { color: C.greenMid },
    rectRadius: 0.05,
  });
  slide.addText('📊 Ringkasan Laporan Keuangan:', {
    x: 0.5, y: 5.96, w: 12.5, h: 0.3,
    color: C.greenDark, fontSize: 10, bold: true, fontFace: 'Calibri',
  });
  slide.addText('Data transaksi dapat digunakan untuk membuat laporan keuangan bulanan atau tahunan. Export data (jika tersedia) untuk analisis lebih lanjut di spreadsheet. Gunakan fitur filter dan pencarian untuk mempermudah rekap data.', {
    x: 0.5, y: 6.28, w: 12.5, h: 0.85,
    color: C.greenDark, fontSize: 9, fontFace: 'Calibri', wrap: true,
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
//  SLIDE 22 – RINGKASAN & PENUTUP
// ═══════════════════════════════════════════════════════════════════════════════
{
  const slide = pptx.addSlide();
  slide.background = { color: C.white };

  // Left green panel
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: 5.2, h: 7.5,
    fill: { color: C.green },
    line: { color: C.green },
  });

  addDotPattern(slide, 0.3, 5.8, 4, 8);

  // Recycle icon
  slide.addShape(pptx.ShapeType.ellipse, {
    x: 0.8, y: 0.6, w: 1.2, h: 1.2,
    fill: { color: C.greenDark },
    line: { color: C.white, pt: 2 },
  });
  slide.addText('♻', {
    x: 0.8, y: 0.6, w: 1.2, h: 1.2,
    fontSize: 34, align: 'center', valign: 'middle',
    color: C.white,
  });

  slide.addText('TERIMA\nKASIH', {
    x: 0.3, y: 2.1, w: 4.6, h: 1.4,
    color: C.white, fontSize: 32, bold: true,
    fontFace: 'Calibri', align: 'center',
  });

  slide.addText('RecycleHub', {
    x: 0.3, y: 3.6, w: 4.6, h: 0.6,
    color: C.greenLight, fontSize: 18, bold: true,
    fontFace: 'Calibri', align: 'center',
  });

  slide.addShape(pptx.ShapeType.rect, {
    x: 0.5, y: 4.3, w: 4.2, h: 0.04,
    fill: { color: C.greenDark },
    line: { color: C.greenDark },
  });

  slide.addText('Panduan Pengguna RecycleHub\nVersi 1.0  •  Oktober 2026', {
    x: 0.3, y: 4.45, w: 4.6, h: 0.7,
    color: C.white, fontSize: 10,
    fontFace: 'Calibri', align: 'center',
  });

  slide.addText('Jika ada pertanyaan atau kendala,\nhubungi Administrator sistem.', {
    x: 0.3, y: 5.3, w: 4.6, h: 0.8,
    color: C.greenLight, fontSize: 10,
    fontFace: 'Calibri', align: 'center',
  });

  // Right panel – Summary
  slide.addText('Ringkasan Fitur', {
    x: 5.5, y: 0.3, w: 7.5, h: 0.5,
    color: C.gray900, fontSize: 18, bold: true, fontFace: 'Calibri',
  });

  slide.addShape(pptx.ShapeType.rect, {
    x: 5.5, y: 0.85, w: 7.5, h: 0.04,
    fill: { color: C.green },
    line: { color: C.green },
  });

  // Summary table
  const summaryRows = [
    { role: '👤 USER', features: 'Daftar, Login, Dashboard, Buat Laporan, Edit/Hapus Laporan, Tukar Reward, Lihat Transaksi, Edit Profil' },
    { role: '🛡️ ADMIN', features: 'Login Admin, Monitor Laporan, Update Status, Kelola Pengguna, Kelola Jenis Sampah, Kelola Wilayah, Kelola Reward, Konfirmasi Redeem, Lihat Transaksi' },
  ];

  summaryRows.forEach((row, i) => {
    slide.addShape(pptx.ShapeType.rect, {
      x: 5.5, y: 1.05 + i * 1.6, w: 7.5, h: 1.45,
      fill: { color: i === 0 ? C.greenLight : 'e0e7ff' },
      line: { color: i === 0 ? C.greenMid : 'a5b4fc' },
      rectRadius: 0.05,
    });
    slide.addText(row.role, {
      x: 5.65, y: 1.12 + i * 1.6, w: 7.2, h: 0.35,
      color: i === 0 ? C.greenDark : '3730a3', fontSize: 11, bold: true, fontFace: 'Calibri',
    });
    slide.addText(row.features, {
      x: 5.65, y: 1.48 + i * 1.6, w: 7.2, h: 0.95,
      color: i === 0 ? C.greenDark : '3730a3', fontSize: 9.5, fontFace: 'Calibri', wrap: true,
    });
  });

  // Quick tips
  slide.addText('Tips Penggunaan:', {
    x: 5.5, y: 4.4, w: 7.5, h: 0.35,
    color: C.gray900, fontSize: 12, bold: true, fontFace: 'Calibri',
  });

  const tips = [
    '✅ Selalu upload foto sampah yang jelas untuk mempercepat proses verifikasi',
    '✅ Pantau status laporan secara berkala dari dashboard pengguna',
    '✅ Tukar poin sebelum kedaluwarsa (jika berlaku batas waktu)',
    '✅ Admin: Update status laporan sesegera mungkin untuk kepuasan pengguna',
    '✅ Admin: Pastikan stok reward selalu diperbarui setelah konfirmasi penukaran',
  ];

  tips.forEach((tip, i) => {
    slide.addText(tip, {
      x: 5.5, y: 4.85 + i * 0.5, w: 7.5, h: 0.42,
      color: C.gray700, fontSize: 9.5, fontFace: 'Calibri',
    });
  });
}

// ─── SAVE ─────────────────────────────────────────────────────────────────────
const outputPath = path.join(__dirname, 'RecycleHub_User_Manual.pptx');
pptx.writeFile({ fileName: outputPath })
  .then(() => {
    console.log('✅ User Manual PPTX berhasil dibuat!');
    console.log('📁 File tersimpan di:', outputPath);
    console.log(`📊 Total slides: 22`);
  })
  .catch((err) => {
    console.error('❌ Error membuat PPTX:', err);
    process.exit(1);
  });
