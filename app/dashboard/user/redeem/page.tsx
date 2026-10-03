'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
  Clock,
  Package,
  Coins,
} from 'lucide-react';
import { Toast } from '@/app/components/UI/Toast';
import { LogoutButton } from '@/app/components/UI/LogoutButton';
import { Breadcrumb } from '@/app/components/UI/Breadcrumb';

interface Redeem {
  id: string;
  poinDigunakan: number;
  status: 'PENDING' | 'DIPROSES' | 'SELESAI' | 'BATAL';
  createdAt: string;
  reward: {
    nama: string;
    gambar: string | null;
  };
}

const statusConfig = {
  PENDING: { label: 'Menunggu', bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
  DIPROSES: { label: 'Diproses', bg: 'bg-blue-100', text: 'text-blue-800', icon: Package },
  SELESAI: { label: 'Selesai', bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle2 },
  BATAL: { label: 'Batal', bg: 'bg-red-100', text: 'text-red-800', icon: X },
};

export default function MyRedemptionsPage() {
  const router = useRouter();
  const [redeems, setRedeems] = useState<Redeem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchRedeems = async () => {
      try {
        const res = await fetch('/api/redeem');
        if (res.ok) {
          const data = await res.json();
          if (mounted) setRedeems(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching redeems:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void fetchRedeems();
    return () => { mounted = false; };
  }, [router]);

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
          <p className="text-gray-600">Memuat riwayat penukaran...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 md:py-8">
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumb items={[
          { label: 'Riwayat Penukaran', href: '/dashboard/user/redeem' }
        ]} />

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard/user/rewards')}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Riwayat Penukaran</h1>
              <p className="text-sm text-gray-500 mt-1">
                Lihat history penukaran poin Anda
              </p>
            </div>
          </div>
          <LogoutButton variant="icon" />
        </div>

        {/* Redeems List */}
        {redeems.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-gray-500">Belum ada riwayat penukaran</p>
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
                        <Image
                          src={redeem.reward.gambar}
                          alt={redeem.reward.nama}
                          width={64}
                          height={64}
                          className="rounded-xl object-cover"
                          unoptimized
                        />
                      ) : (
                        <Package className="w-8 h-8 text-gray-400" />
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
                      <p className="text-xs text-gray-400 mt-2">{formatDate(redeem.createdAt)}</p>
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
