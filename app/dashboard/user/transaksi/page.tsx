'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
  Clock,
  Package,
  XCircle,
  Coins,
  Eye,
} from 'lucide-react';
import { Toast } from '@/app/components/UI/Toast';
import { LogoutButton } from '@/app/components/UI/LogoutButton';
import { Breadcrumb } from '@/app/components/UI/Breadcrumb';

interface Redeem {
  id: string;
  poinDigunakan: number;
  status: 'PENDING' | 'DIPROSES' | 'SELESAI' | 'BATAL';
  createdAt: string;
  tipePembayaran?: string;
  metodePembayaran?: string;
  statusPembayaran?: string;
  tanggalJatuhTempo?: string;
  reward: {
    nama: string;
    gambar: string | null;
    poin: number;
  };
}

const statusConfig = {
  PENDING: { label: 'Menunggu', bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
  DIPROSES: { label: 'Diproses', bg: 'bg-blue-100', text: 'text-blue-800', icon: Package },
  SELESAI: { label: 'Selesai', bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle2 },
  BATAL: { label: 'Batal', bg: 'bg-red-100', text: 'text-red-800', icon: XCircle },
};

const paymentMethodLabels: Record<string, string> = {
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

export default function MyTransactionsPage() {
  const router = useRouter();
  const [redeems, setRedeems] = useState<Redeem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let mounted = true;
    const fetchRedeems = async () => {
      try {
        const res = await fetch('/api/redeem?limit=100');
        if (res.ok) {
          const data = await res.json();
          if (mounted) setRedeems(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching transactions:', error);
        if (mounted) setError('Gagal memuat data');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void fetchRedeems();
    return () => { mounted = false; };
  }, []);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-green-600 mx-auto mb-3" />
          <p className="text-gray-600">Memuat transaksi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 md:py-8">
      {error && (
        <div className="max-w-4xl mx-auto px-4 mb-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
            <button onClick={() => setError('')} className="ml-auto text-red-500 hover:text-red-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {success && (
        <div className="max-w-4xl mx-auto px-4 mb-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
            <p className="text-sm text-green-700">{success}</p>
            <button onClick={() => setSuccess('')} className="ml-auto text-green-500 hover:text-green-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumb items={[
          { label: 'Transaksi Saya', href: '/dashboard/user/transaksi' }
        ]} />

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Transaksi Saya</h1>
              <p className="text-sm text-gray-500 mt-1">
                Riwayat penukaran poin Anda
              </p>
            </div>
          </div>
          <LogoutButton variant="icon" />
        </div>

        {/* Transactions List */}
        {redeems.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="text-6xl mb-4">📋</div>
            <p className="text-gray-500">Belum ada transaksi</p>
            <button
              onClick={() => router.push('/dashboard/user/rewards')}
              className="mt-4 px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition"
            >
              Lihat Reward
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {redeems.map((redeem) => {
              const status = statusConfig[redeem.status];
              const StatusIcon = status.icon;
              return (
                <div
                  key={redeem.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                      {redeem.reward.gambar ? (
                        <img
                          src={redeem.reward.gambar}
                          alt={redeem.reward.nama}
                          className="w-16 h-16 rounded-xl object-cover"
                        />
                      ) : (
                        <span className="text-3xl">🎁</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-semibold text-gray-900">{redeem.reward.nama}</h3>
                          <div className="flex items-center gap-1 text-green-600 mt-1">
                            <Coins className="w-4 h-4" />
                            <span className="text-sm font-medium">{redeem.poinDigunakan} poin</span>
                          </div>
                        </div>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </span>
                      </div>

                      {/* Payment Info */}
                      {(redeem.tipePembayaran || redeem.metodePembayaran || redeem.statusPembayaran) && (
                        <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs">
                          {redeem.tipePembayaran && (
                            <div>
                              <span className="text-gray-500">Tipe:</span>
                              <span className="ml-1 text-gray-900">{redeem.tipePembayaran === 'KREDIT' ? 'Kredit' : 'Cash'}</span>
                            </div>
                          )}
                          {redeem.metodePembayaran && (
                            <div>
                              <span className="text-gray-500">Metode:</span>
                              <span className="ml-1 text-gray-900">{paymentMethodLabels[redeem.metodePembayaran] || redeem.metodePembayaran}</span>
                            </div>
                          )}
                          {redeem.statusPembayaran && (
                            <div>
                              <span className="text-gray-500">Status Bayar:</span>
                              <span className={`ml-1 ${
                                redeem.statusPembayaran === 'LUNAS' ? 'text-green-600' :
                                redeem.statusPembayaran === 'JATUH_TEMPO' ? 'text-yellow-600' : 'text-red-600'
                              }`}>
                                {redeem.statusPembayaran === 'LUNAS' ? 'Lunas' :
                                 redeem.statusPembayaran === 'JATUH_TEMPO' ? 'Jatuh Tempo' : 'Belum Bayar'}
                              </span>
                            </div>
                          )}
                          {redeem.tanggalJatuhTempo && (
                            <div>
                              <span className="text-gray-500">Jatuh Tempo:</span>
                              <span className="ml-1 text-gray-900">{formatDate(redeem.tanggalJatuhTempo)}</span>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-3">
                        <p className="text-xs text-gray-400">{formatDate(redeem.createdAt)}</p>
                        <button
                          onClick={() => window.open(`/dashboard/admin/redeem/${redeem.id}/receipt`, '_blank')}
                          className="text-xs text-green-600 hover:text-green-700 flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Lihat Struk</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
