'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Loader2, AlertCircle, Printer, ArrowLeft } from 'lucide-react';
import { LogoutButton } from '@/app/components/UI/LogoutButton';

interface Redeem {
  id: string;
  poinDigunakan: number;
  status: string;
  createdAt: string;
  tipePembayaran?: string;
  metodePembayaran?: string;
  statusPembayaran?: string;
  tanggalJatuhTempo?: string;
  buktiPembayaran?: string;
  catatan?: string;
  reward: {
    nama: string;
    gambar: string | null;
    poin: number;
  };
  user: {
    id: string;
    nama: string;
    email: string;
  };
}

export default function ReceiptPage() {
  const params = useParams();
  const [redeem, setRedeem] = useState<Redeem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReceipt = async () => {
      try {
        const res = await fetch(`/api/redeem/${params.id}`);
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Gagal memuat data');
        }
        const data = await res.json();
        setRedeem(data);
      } catch (error) {
        console.error('Error fetching receipt:', error);
        setError(error instanceof Error ? error.message : 'Terjadi kesalahan');
      } finally {
        setLoading(false);
      }
    };
    if (params.id) {
      void fetchReceipt();
    }
  }, [params.id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-green-600 mx-auto mb-3" />
          <p className="text-gray-600">Memuat struk...</p>
        </div>
      </div>
    );
  }

  if (error || !redeem) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <p className="text-gray-600">{error || 'Struk tidak ditemukan'}</p>
        </div>
      </div>
    );
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPaymentMethodLabel = (method?: string) => {
    const methods: Record<string, string> = {
      cash: 'Cash',
      ovo: 'OVO',
      gopay: 'GoPay',
      dana: 'Dana',
      shopeepay: 'ShopeePay',
      bca: 'BCA',
      bni: 'BNI',
      bri: 'BRI',
      mandiri: 'Mandiri',
    };
    return methods[method || 'cash'] || method || 'Cash';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Actions - hidden when printing */}
        <div className="flex justify-between items-center mb-6 print:hidden">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>Print Struk</span>
          </button>
        </div>

        {/* Receipt */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-linear-to-r from-green-600 to-emerald-600 p-6 text-white">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-1">RecycleHub</h1>
              <p className="text-sm text-green-100">Stuk Penukaran Poin</p>
            </div>
          </div>

          {/* Receipt Body */}
          <div className="p-6 md:p-8">
            {/* Receipt Number & Date */}
            <div className="flex justify-between items-start mb-6 pb-4 border-b border-gray-100">
              <div>
                <p className="text-xs text-gray-500">No. Transaksi</p>
                <p className="text-sm font-mono font-medium text-gray-900">{redeem.id.slice(0, 8).toUpperCase()}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Tanggal</p>
                <p className="text-sm font-medium text-gray-900">{formatDate(redeem.createdAt)}</p>
              </div>
            </div>

            {/* Customer Info */}
            <div className="mb-6 pb-4 border-b border-gray-100">
              <p className="text-xs text-gray-500 mb-1">Pelanggan</p>
              <p className="text-sm font-medium text-gray-900">{redeem.user.nama}</p>
              <p className="text-xs text-gray-500">{redeem.user.email}</p>
            </div>

            {/* Item */}
            <div className="mb-6 pb-4 border-b border-gray-100">
              <p className="text-xs text-gray-500 mb-2">Item</p>
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                  {redeem.reward.gambar ? (
                    <Image
                      src={redeem.reward.gambar}
                      alt={redeem.reward.nama}
                      width={64}
                      height={64}
                      className="rounded-lg object-cover"
                      unoptimized
                    />
                  ) : (
                    <span className="text-3xl">🎁</span>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{redeem.reward.nama}</p>
                  <p className="text-xs text-gray-500">Harga: {redeem.reward.poin} poin</p>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="mb-6 pb-4 border-b border-gray-100 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Tipe Pembayaran</span>
                <span className="text-sm font-medium text-gray-900">
                  {redeem.tipePembayaran === 'KREDIT' ? 'Kredit' : 'Cash'}
                </span>
              </div>
              {redeem.metodePembayaran && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Metode</span>
                  <span className="text-sm font-medium text-gray-900">{getPaymentMethodLabel(redeem.metodePembayaran)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Status Pembayaran</span>
                <span className={`text-sm font-medium ${
                  redeem.statusPembayaran === 'LUNAS' ? 'text-green-600' :
                  redeem.statusPembayaran === 'JATUH_TEMPO' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {redeem.statusPembayaran === 'LUNAS' ? 'Lunas' :
                   redeem.statusPembayaran === 'JATUH_TEMPO' ? 'Jatuh Tempo' : 'Belum Bayar'}
                </span>
              </div>
              {redeem.tanggalJatuhTempo && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Jatuh Tempo</span>
                  <span className="text-sm font-medium text-gray-900">{formatDate(redeem.tanggalJatuhTempo)}</span>
                </div>
              )}
              {redeem.buktiPembayaran && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Bukti Pembayaran</span>
                  <a href={redeem.buktiPembayaran} target="_blank" rel="noopener noreferrer" className="text-sm text-green-600 hover:underline">
                    Lihat Bukti
                  </a>
                </div>
              )}
              {redeem.catatan && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500">Catatan</p>
                  <p className="text-sm text-gray-700">{redeem.catatan}</p>
                </div>
              )}
            </div>

            {/* Total */}
            <div className="bg-green-50 rounded-xl p-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-sm text-green-700">Total Poin</span>
                <span className="text-2xl font-bold text-green-900">{redeem.poinDigunakan}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center text-xs text-gray-400 pt-4 border-t border-gray-100">
              <p>Terima kasih telah berpartisipasi dalam daur ulang!</p>
              <p className="mt-1">RecycleHub - Daur Ulang untuk masa depan yang lebih hijau</p>
            </div>
          </div>
        </div>

        {/* Logout */}
        <div className="mt-6 print:hidden">
          <LogoutButton variant="icon" />
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
