'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  ShoppingBag,
  Coins,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
  Sparkles,
} from 'lucide-react';
import { Toast } from '@/app/components/UI/Toast';
import { LogoutButton } from '@/app/components/UI/LogoutButton';
import { Breadcrumb } from '@/app/components/UI/Breadcrumb';

interface Reward {
  id: string;
  nama: string;
  deskripsi: string | null;
  gambar: string | null;
  poin: number;
  stok: number;
}

interface Poin {
  jumlahPoin: number;
}

export default function RewardsPage() {
  const router = useRouter();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [poin, setPoin] = useState<Poin | null>(null);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        const [poinRes, rewardsRes] = await Promise.all([
          fetch('/api/auth/me'),
          fetch('/api/rewards'),
        ]);

        if (poinRes.ok) {
          const poinData = await poinRes.json();
          if (mounted) setPoin({ jumlahPoin: poinData.poin?.jumlahPoin || 0 });
        }

        if (rewardsRes.ok) {
          const rewardsData = await rewardsRes.json();
          if (mounted) setRewards(rewardsData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void fetchData();
    return () => { mounted = false; };
  }, [router]);

  const handleRedeem = async (rewardId: string, poinRequired: number) => {
    if (!poin || poin.jumlahPoin < poinRequired) {
      setToast({ message: 'Poin Anda tidak cukup', type: 'error' });
      return;
    }

    setRedeeming(rewardId);
    try {
      const res = await fetch('/api/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rewardId }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal menukar poin');
      }

      setPoin(prev => prev ? { ...prev, jumlahPoin: prev.jumlahPoin - poinRequired } : prev);
      setRewards(prev => prev.map(r => r.id === rewardId ? { ...r, stok: r.stok - 1 } : r));
      setToast({ message: 'Penukaran berhasil! Silakan tunggu konfirmasi admin.', type: 'success' });
    } catch (err) {
      setToast({
        message: err instanceof Error ? err.message : 'Terjadi kesalahan',
        type: 'error',
      });
    } finally {
      setRedeeming(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-green-600 mx-auto mb-3" />
          <p className="text-gray-600">Memuat reward...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 md:py-8">
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumb items={[
          { label: 'Reward', href: '/dashboard/user/rewards' }
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
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Katalog Reward</h1>
              <p className="text-sm text-gray-500 mt-1">
                Tukar poin Anda dengan berbagai reward menarik
              </p>
            </div>
          </div>
          <LogoutButton variant="icon" />
        </div>

        {/* Points Badge */}
        <div className="bg-linear-to-r from-green-600 to-emerald-600 rounded-2xl shadow-xl p-6 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <Coins className="w-8 h-8 text-yellow-300" />
              </div>
              <div>
                <p className="text-sm text-green-100">Poin Anda</p>
                <p className="text-3xl font-bold">{poin?.jumlahPoin || 0}</p>
              </div>
            </div>
            <Sparkles className="w-12 h-12 text-yellow-300 opacity-50" />
          </div>
        </div>

        {/* Rewards Grid */}
        {rewards.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎁</div>
            <p className="text-gray-500">Belum ada reward tersedia</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rewards.map((reward) => {
              const canRedeem = reward.stok > 0 && (poin?.jumlahPoin || 0) >= reward.poin;
              return (
                <div
                  key={reward.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition"
                >
                  <div className="relative h-48 bg-gray-100">
                    {reward.gambar ? (
                      <Image
                        src={reward.gambar}
                        alt={reward.nama}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-6xl">
                        🎁
                      </div>
                    )}
                    {reward.stok <= 0 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white font-semibold">HABIS</span>
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{reward.nama}</h3>
                    {reward.deskripsi && (
                      <p className="text-sm text-gray-500 mb-3 line-clamp-2">{reward.deskripsi}</p>
                    )}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-1 text-green-600">
                        <Coins className="w-5 h-5" />
                        <span className="font-bold text-lg">{reward.poin}</span>
                        <span className="text-sm text-gray-500">poin</span>
                      </div>
                      <span className="text-xs text-gray-400">Stok: {reward.stok}</span>
                    </div>
                    <button
                      onClick={() => handleRedeem(reward.id, reward.poin)}
                      disabled={!canRedeem || redeeming === reward.id}
                      className="w-full py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {redeeming === reward.id ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Memproses...</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-4 h-4" />
                          <span>Tukar</span>
                        </>
                      )}
                    </button>
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
