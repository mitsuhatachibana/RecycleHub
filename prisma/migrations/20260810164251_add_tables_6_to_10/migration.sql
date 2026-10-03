-- AlterTable
ALTER TABLE "jenis_sampah" ADD COLUMN     "kategoriId" TEXT;

-- CreateTable
CREATE TABLE "kategori_sampah" (
    "id" TEXT NOT NULL,
    "nama" VARCHAR(50) NOT NULL,
    "deskripsi" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kategori_sampah_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "poin" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jumlahPoin" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "poin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pengumuman" (
    "id" TEXT NOT NULL,
    "judul" VARCHAR(255) NOT NULL,
    "isi" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pengumuman_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "riwayat_laporan" (
    "id" TEXT NOT NULL,
    "laporanId" TEXT NOT NULL,
    "statusLama" "StatusLaporan" NOT NULL,
    "statusBaru" "StatusLaporan" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "riwayat_laporan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "kategori_sampah_nama_key" ON "kategori_sampah"("nama");

-- CreateIndex
CREATE UNIQUE INDEX "poin_userId_key" ON "poin"("userId");

-- AddForeignKey
ALTER TABLE "jenis_sampah" ADD CONSTRAINT "jenis_sampah_kategoriId_fkey" FOREIGN KEY ("kategoriId") REFERENCES "kategori_sampah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "poin" ADD CONSTRAINT "poin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "riwayat_laporan" ADD CONSTRAINT "riwayat_laporan_laporanId_fkey" FOREIGN KEY ("laporanId") REFERENCES "laporan_sampah"("id") ON DELETE CASCADE ON UPDATE CASCADE;
