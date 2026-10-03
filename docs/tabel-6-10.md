# Dokumentasi Tabel 6–10 — RecycleHub

## Tabel 6: `transaksi`

### Deskripsi
Mencatat seluruh transaksi jual beli sampah antara user dan sistem.

### Struktur Kolom

| Kolom | Tipe | Constraint | Keterangan |
|-------|------|------------|------------|
| `id` | `String` (UUID) | PRIMARY KEY, DEFAULT uuid() | ID unik transaksi |
| `userId` | `String` (UUID) | FOREIGN KEY → users(id) ON DELETE CASCADE | ID user yang melakukan transaksi |
| `laporanId` | `String` (UUID) | FOREIGN KEY → laporan_sampah(id), UNIQUE | ID laporan sampah yang ditransaksikan |
| `totalHarga` | `Float` | — | Total harga transaksi |
| `status` | `StatusTransaksi` (enum) | DEFAULT 'PENDING' | Status transaksi: PENDING, SELESAI, BATAL |
| `tanggalTransaksi` | `DateTime` | DEFAULT now() | Waktu transaksi dibuat |
| `createdAt` | `DateTime` | DEFAULT now() | Waktu record dibuat |
| `updatedAt` | `DateTime` | updatedAt | Waktu record terakhir diubah |

### Relasi
- **Many-to-One** ke `User` via `userId`
- **One-to-One** ke `LaporanSampah` via `laporanId`

### Constraint Kunci
- `laporanId` unique — memastikan 1 laporan hanya bisa ditransaksikan sekali
- `userId` dengan `ON DELETE CASCADE` — jika user dihapus, transaksi-nya ikut terhapus

---

## Tabel 7: `kategori_sampah`

### Deskripsi
Menyimpan kategori-kategori sampah untuk mengelompokkan jenis-jenis sampah.

### Struktur Kolom

| Kolom | Tipe | Constraint | Keterangan |
|-------|------|------------|------------|
| `id` | `String` (UUID) | PRIMARY KEY, DEFAULT uuid() | ID unik kategori |
| `nama` | `VarChar(50)` | UNIQUE | Nama kategori (misal: Organik, Anorganik, B3) |
| `deskripsi` | `String?` (Text) | Nullable | Deskripsi kategori |
| `createdAt` | `DateTime` | DEFAULT now() | Waktu record dibuat |
| `updatedAt` | `DateTime` | updatedAt | Waktu record terakhir diubah |

### Relasi
- **One-to-Many** ke `JenisSampah` — 1 kategori bisa memiliki banyak jenis sampah

### Constraint Kunci
- `nama` unique — mencegah duplikasi kategori

---

## Tabel 8: `poin`

### Deskripsi
Menyimpan jumlah poin reward yang diperoleh setiap user dari kegiatan daur ulang.

### Struktur Kolom

| Kolom | Tipe | Constraint | Keterangan |
|-------|------|------------|------------|
| `id` | `String` (UUID) | PRIMARY KEY, DEFAULT uuid() | ID unik record poin |
| `userId` | `String` (UUID) | FOREIGN KEY → users(id), UNIQUE, ON DELETE CASCADE | ID user pemilik poin |
| `jumlahPoin` | `Int` | DEFAULT 0 | Jumlah poin saat ini |
| `createdAt` | `DateTime` | DEFAULT now() | Waktu record dibuat |
| `updatedAt` | `DateTime` | updatedAt | Waktu record terakhir diubah |

### Relasi
- **One-to-One** ke `User` via `userId`

### Constraint Kunci
- `userId` unique — setiap user hanya memiliki 1 record poin
- `ON DELETE CASCADE` — jika user dihapus, poin-nya ikut terhapus

---

## Tabel 9: `pengumuman`

### Deskripsi
Menampung pengumuman atau informasi penting yang bisa ditampilkan ke seluruh user.

### Struktur Kolom

| Kolom | Tipe | Constraint | Keterangan |
|-------|------|------------|------------|
| `id` | `String` (UUID) | PRIMARY KEY, DEFAULT uuid() | ID unik pengumuman |
| `judul` | `VarChar(255)` | — | Judul pengumuman |
| `isi` | `String` (Text) | — | Isi lengkap pengumuman |
| `createdAt` | `DateTime` | DEFAULT now() | Waktu pengumuman dibuat |
| `updatedAt` | `DateTime` | updatedAt | Waktu record terakhir diubah |

### Relasi
- **Tidak memiliki relasi** ke tabel lain (standalone)

### Constraint Kunci
- Tidak ada foreign key atau unique constraint selain primary key

---

## Tabel 10: `riwayat_laporan`

### Deskripsi
Mencatat setiap perubahan status pada laporan sampah (audit trail).

### Struktur Kolom

| Kolom | Tipe | Constraint | Keterangan |
|-------|------|------------|------------|
| `id` | `String` (UUID) | PRIMARY KEY, DEFAULT uuid() | ID unik riwayat |
| `laporanId` | `String` (UUID) | FOREIGN KEY → laporan_sampah(id) ON DELETE CASCADE | ID laporan yang diubah statusnya |
| `userId` | `String` (UUID) | FOREIGN KEY → users(id) ON DELETE CASCADE | ID user yang membuat perubahan |
| `statusLama` | `StatusLaporan` (enum) | — | Status sebelum perubahan |
| `statusBaru` | `StatusLaporan` (enum) | — | Status setelah perubahan |
| `createdAt` | `DateTime` | DEFAULT now() | Waktu perubahan status |

### Relasi
- **Many-to-One** ke `LaporanSampah` via `laporanId` — 1 laporan bisa memiliki banyak riwayat perubahan
- **Many-to-One** ke `User` via `userId` — 1 user bisa membuat banyak riwayat perubahan

### Constraint Kunci
- `ON DELETE CASCADE` — jika laporan atau user dihapus, seluruh riwayatnya ikut terhapus
- Tidak ada constraint `statusLama != statusBaru` di level database (divalidasi di aplikasi)

---

## Ringkasan Relasi Antar Tabel 6–10

```
User ──────┐
           ├──< Transaksi (6)
           │
LaporanSampah ──< Transaksi (6)
            │
            └──< RiwayatLaporan (10) ──< User

KategoriSampah (7) ──> JenisSampah

User ───< Poin (8)      (One-to-One)

Pengumuman (9)          (Standalone)
```

---

## Cara Mengambil Screenshot di Prisma Studio

1. Jalankan perintah:
   ```bash
   npx prisma studio
   ```
2. Buka browser di `http://localhost:5555`
3. Pilih masing-masing tabel: **Transaksi**, **KategoriSampah**, **Poin**, **Pengumuman**, **RiwayatLaporan**
4. Screenshot tampilan tabel dan datanya
5. Untuk screenshot model Prisma, buka file `prisma/schema.prisma` dan screenshot bagian model nomor 6 sampai 10

---

## Catatan
- Semua tabel menggunakan UUID sebagai primary key
- Timestamp `createdAt` dan `updatedAt` diterapkan secara otomatis
- Relasi berlebih (cascade/restrict) ditentukan berdasarkan kebutuhan bisnis:
  - `CASCADE` untuk data yang tidak berdiri sendiri (transaksi, poin, riwayat)
  - `RESTRICT` untuk data master yang tidak boleh dihapus jika masih dipakai (jenis sampah, wilayah, kategori)
