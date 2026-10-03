-- Tabel 6: transaksi
CREATE TABLE "transaksi" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL,
    "laporanId" TEXT NOT NULL,
    "totalHarga" DOUBLE PRECISION NOT NULL,
    "status" "StatusTransaksi" NOT NULL DEFAULT 'PENDING',
    "tanggalTransaksi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transaksi_pkey" PRIMARY KEY ("id")
);

-- Unique constraint untuk laporanId
CREATE UNIQUE INDEX "transaksi_laporanId_key" ON "transaksi"("laporanId");

-- Foreign key: userId -> users
ALTER TABLE "transaksi" ADD CONSTRAINT "transaksi_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- Foreign key: laporanId -> laporan_sampah
ALTER TABLE "transaksi" ADD CONSTRAINT "transaksi_laporanId_fkey"
    FOREIGN KEY ("laporanId") REFERENCES "laporan_sampah"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;


-- Tabel 7: kategori_sampah
CREATE TABLE "kategori_sampah" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "nama" VARCHAR(50) NOT NULL,
    "deskripsi" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kategori_sampah_pkey" PRIMARY KEY ("id")
);

-- Unique constraint untuk nama
CREATE UNIQUE INDEX "kategori_sampah_nama_key" ON "kategori_sampah"("nama");


-- Tabel 8: poin
CREATE TABLE "poin" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL,
    "jumlahPoin" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "poin_pkey" PRIMARY KEY ("id")
);

-- Unique constraint untuk userId
CREATE UNIQUE INDEX "poin_userId_key" ON "poin"("userId");

-- Foreign key: userId -> users
ALTER TABLE "poin" ADD CONSTRAINT "poin_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;


-- Tabel 9: pengumuman
CREATE TABLE "pengumuman" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "judul" VARCHAR(255) NOT NULL,
    "isi" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pengumuman_pkey" PRIMARY KEY ("id")
);


-- Tabel 10: riwayat_laporan
CREATE TABLE "riwayat_laporan" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "laporanId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "statusLama" "StatusLaporan" NOT NULL,
    "statusBaru" "StatusLaporan" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "riwayat_laporan_pkey" PRIMARY KEY ("id")
);

-- Foreign key: laporanId -> laporan_sampah
ALTER TABLE "riwayat_laporan" ADD CONSTRAINT "riwayat_laporan_laporanId_fkey"
    FOREIGN KEY ("laporanId") REFERENCES "laporan_sampah"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- Foreign key: userId -> users
ALTER TABLE "riwayat_laporan" ADD CONSTRAINT "riwayat_laporan_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;


-- Enum definitions
CREATE TYPE "StatusTransaksi" AS ENUM ('PENDING', 'SELESAI', 'BATAL');
CREATE TYPE "StatusLaporan" AS ENUM ('MENUNGGU', 'DIPROSES', 'SELESAI', 'DITOLAK');
