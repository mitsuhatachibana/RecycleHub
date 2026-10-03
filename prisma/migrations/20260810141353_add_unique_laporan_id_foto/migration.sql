/*
  Warnings:

  - You are about to drop the `foto_sampah` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "foto_sampah" DROP CONSTRAINT "foto_sampah_laporanId_fkey";

-- DropTable
DROP TABLE "foto_sampah";

-- CreateTable
CREATE TABLE "FotoSampah" (
    "id" TEXT NOT NULL,
    "laporanId" TEXT NOT NULL,
    "urlFoto" TEXT NOT NULL,
    "deskripsi" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FotoSampah_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FotoSampah_laporanId_key" ON "FotoSampah"("laporanId");

-- AddForeignKey
ALTER TABLE "FotoSampah" ADD CONSTRAINT "FotoSampah_laporanId_fkey" FOREIGN KEY ("laporanId") REFERENCES "laporan_sampah"("id") ON DELETE CASCADE ON UPDATE CASCADE;
