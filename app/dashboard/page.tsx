'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Leaf,
  Users,
  Trash2,
  MapPin,
  TrendingUp,
  Package,
  DollarSign,
  Clock,
  User,
  Mail,
  Phone,
  Calendar,
} from 'lucide-react';
import { LogoutButton } from '@/app/components/UI/LogoutButton';

interface User {
  id: string;
  nama: string;
  nik: string;
  email: string;
  noHp: string;
  role: 'ADMIN' | 'USER';
  alamat: string | null;
  fotoProfil: string | null;
  createdAt: string;
}

interface Laporan {
  id: string;
  jenisSampah?: {
    namaJenis: string;
  };
  berat: number;
  user?: {
    nama: string;
  };
  createdAt: string;
  status: 'MENUNGGU' | 'DIPROSES' | 'SELESAI' | 'DITOLAK';
}

interface JenisSampah {
  id: string;
  namaJenis: string;
  hargaPerKg?: number;
  _count?: {
    LaporanSampah: number;
  };
}

interface DashboardStats {
  totalUsers: number;
  totalLaporan: number;
  totalWilayah: number;
  totalJenisSampah: number;
  totalTransaksi: number;
  totalBerat: number;
  laporanMenunggu: number;
  laporanDiproses: number;
  laporanSelesai: number;
  laporanDitolak: number;
  userLaporanCount: number;
  userBeratTotal: number;
  laporanTerbaru: Laporan[];
  jenisSampahPopuler: JenisSampah[];
}

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Cek session
        const userRes = await fetch('/api/auth/me');
        if (!userRes.ok) {
          router.push('/login');
          return;
        }
        const userData = await userRes.json();
        setUser(userData);

        // Fetch dashboard stats
        const statsRes = await fetch('/api/dashboard/stats');
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-green-50 via-emerald-50 to-teal-50">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-green-400 rounded-full blur-2xl opacity-30 animate-pulse"></div>
            <div className="relative bg-linear-to-br from-green-500 to-emerald-600 p-5 rounded-2xl shadow-xl inline-block">
              <Leaf className="w-12 h-12 text-white animate-spin-slow" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">RecycleHub</h2>
          <p className="text-gray-600">Memuat dashboard...</p>
          <div className="flex justify-center gap-2 mt-4">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce animation-delay-200"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce animation-delay-400"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const isAdmin = user.role === 'ADMIN';

  // Admin Stats Cards
  const adminStatCards = [
    {
      title: 'Total User',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'bg-blue-500',
      link: '/dashboard/admin/users'
    },
    {
      title: 'Total Laporan',
      value: stats?.totalLaporan || 0,
      icon: Trash2,
      color: 'bg-green-500',
      link: '/dashboard/admin/laporan'
    },
    {
      title: 'Total Sampah',
      value: `${stats?.totalBerat || 0} kg`,
      icon: Package,
      color: 'bg-orange-500',
      link: '#'
    },
    {
      title: 'Transaksi',
      value: stats?.totalTransaksi || 0,
      icon: DollarSign,
      color: 'bg-yellow-500',
      link: '/dashboard/admin/transaksi'
    },
  ];

  // User Stats Cards
  const userStatCards = [
    {
      title: 'Total Laporan',
      value: stats?.userLaporanCount || 0,
      icon: Trash2,
      color: 'bg-green-500',
      link: '/dashboard/user/laporan'
    },
    {
      title: 'Total Sampah',
      value: `${stats?.userBeratTotal || 0} kg`,
      icon: Package,
      color: 'bg-orange-500',
      link: '#'
    },
    {
      title: 'Menunggu',
      value: stats?.laporanMenunggu || 0,
      icon: Clock,
      color: 'bg-yellow-500',
      link: '/dashboard/user/laporan?status=MENUNGGU'
    },
    {
      title: 'Selesai',
      value: stats?.laporanSelesai || 0,
      icon: TrendingUp,
      color: 'bg-green-500',
      link: '/dashboard/user/laporan?status=SELESAI'
    },
  ];

  const statCards = isAdmin ? adminStatCards : userStatCards;

  // Quick Actions
  const adminActions = [
    { title: 'Kelola User', icon: Users, color: 'bg-blue-50 text-blue-600', link: '/dashboard/admin/users' },
    { title: 'Kelola Laporan', icon: Trash2, color: 'bg-green-50 text-green-600', link: '/dashboard/admin/laporan' },
    { title: 'Kelola Wilayah', icon: MapPin, color: 'bg-purple-50 text-purple-600', link: '/dashboard/admin/wilayah' },
    { title: 'Kelola Jenis Sampah', icon: Package, color: 'bg-orange-50 text-orange-600', link: '/dashboard/admin/jenis-sampah' },
  ];

  const userActions = [
    { title: 'Laporan Baru', icon: Trash2, color: 'bg-green-50 text-green-600', link: '/dashboard/user/laporan/baru' },
    { title: 'Laporan Saya', icon: Clock, color: 'bg-blue-50 text-blue-600', link: '/dashboard/user/laporan' },
    { title: 'Profil Saya', icon: User, color: 'bg-purple-50 text-purple-600', link: '/dashboard/user/profile' },
  ];

  const quickActions = isAdmin ? adminActions : userActions;

  const statusColors = {
    MENUNGGU: 'bg-yellow-100 text-yellow-800',
    DIPROSES: 'bg-blue-100 text-blue-800',
    SELESAI: 'bg-green-100 text-green-800',
    DITOLAK: 'bg-red-100 text-red-800',
  };

  const statusLabels = {
    MENUNGGU: 'Menunggu',
    DIPROSES: 'Diproses',
    SELESAI: 'Selesai',
    DITOLAK: 'Ditolak',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-linear-to-r from-green-600 to-emerald-600 rounded-2xl shadow-xl p-6 md:p-8 mb-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full transform translate-x-32 -translate-y-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full transform -translate-x-24 translate-y-24"></div>
          <div className="relative flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              {user.fotoProfil ? (
                <Image
                  src={user.fotoProfil}
                  alt={user.nama || 'User'}
                  width={64}
                  height={64}
                  className="w-16 h-16 rounded-full border-4 border-white/30 object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
                  {user.nama?.charAt(0) || 'U'}
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold">Selamat Datang, {user.nama}</h1>
                <div className="flex flex-wrap items-center gap-2 text-green-100 text-sm mt-1">
                  <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs font-medium">
                    {isAdmin ? '👑 Admin' : '👤 User'}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {user.email}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {user.noHp}
                  </span>
                </div>
              </div>
            </div>
            <div className="md:ml-auto text-sm text-green-100">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Bergabung: {user.createdAt ? new Date(user.createdAt).toLocaleDateString('id-ID') : '-'}
              </span>
            </div>
            <LogoutButton variant="icon" className="ml-4" />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                onClick={() => stat.link !== '#' && router.push(stat.link)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.color} text-white shadow-lg`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
                {stat.link && stat.link !== '#' && (
                  <span className="text-xs text-green-600 font-medium mt-3 inline-block">
                    Lihat detail →
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-gray-500" />
            Aksi Cepat
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={index}
                  onClick={() => router.push(action.link)}
                  className={`${action.color} p-4 rounded-2xl text-center hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg`}
                >
                  <Icon className="w-8 h-8 mx-auto mb-2" />
                  <p className="font-medium text-sm">{action.title}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Recent Activity & Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Laporan */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-500" />
                Laporan Terbaru
              </h3>
              <button
                onClick={() => router.push(isAdmin ? '/dashboard/admin/laporan' : '/dashboard/user/laporan')}
                className="text-sm text-green-600 hover:text-green-700 font-medium"
              >
                Lihat semua →
              </button>
            </div>
            <div className="space-y-3">
              {stats?.laporanTerbaru && stats.laporanTerbaru.length > 0 ? (
                stats.laporanTerbaru.slice(0, 5).map((laporan: Laporan) => (
                  <div
                    key={laporan.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition cursor-pointer"
                    onClick={() => router.push(
                      isAdmin 
                        ? `/dashboard/admin/laporan/${laporan.id}` 
                        : `/dashboard/user/laporan/${laporan.id}`
                    )}
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                      <Package className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {laporan.jenisSampah?.namaJenis || 'Sampah'}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>{laporan.berat} kg</span>
                        <span>•</span>
                        <span>{laporan.user?.nama || 'User'}</span>
                        <span>•</span>
                        <span>{new Date(laporan.createdAt).toLocaleDateString('id-ID')}</span>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs shrink-0 ${
                      statusColors[laporan.status as keyof typeof statusColors]
                    }`}>
                      {statusLabels[laporan.status as keyof typeof statusLabels]}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>Belum ada laporan</p>
                </div>
              )}
            </div>
          </div>

          {/* Side Stats */}
          <div className="space-y-6">
            {/* Status Summary */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-gray-500" />
                Status Laporan
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Menunggu</span>
                    <span className="font-medium">{stats?.laporanMenunggu || 0}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${stats?.totalLaporan ? ((stats.laporanMenunggu || 0) / stats.totalLaporan) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Diproses</span>
                    <span className="font-medium">{stats?.laporanDiproses || 0}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${stats?.totalLaporan ? ((stats.laporanDiproses || 0) / stats.totalLaporan) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Selesai</span>
                    <span className="font-medium">{stats?.laporanSelesai || 0}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${stats?.totalLaporan ? ((stats.laporanSelesai || 0) / stats.totalLaporan) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Ditolak</span>
                    <span className="font-medium">{stats?.laporanDitolak || 0}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${stats?.totalLaporan ? ((stats.laporanDitolak || 0) / stats.totalLaporan) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Jenis Sampah Populer */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-gray-500" />
                Jenis Sampah Populer
              </h3>
              <div className="space-y-3">
                {stats?.jenisSampahPopuler && stats.jenisSampahPopuler.length > 0 ? (
                  stats.jenisSampahPopuler.slice(0, 4).map((item: JenisSampah) => (
                    <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-700">{item.namaJenis}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">{item._count?.LaporanSampah || 0} laporan</span>
                        <span className="text-xs font-medium text-green-600">
                          Rp {item.hargaPerKg?.toLocaleString()}/kg
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm text-center">Belum ada data</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-400 border-t border-gray-200 pt-6">
          <p>© 2026 RecycleHub. All rights reserved.</p>
          <p className="mt-1">Membangun lingkungan lebih hijau 🌱</p>
        </div>
      </div>

      {/* Custom CSS */}
      <style jsx>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
        .animation-delay-200 {
          animation-delay: 200ms;
        }
        .animation-delay-400 {
          animation-delay: 400ms;
        }
      `}</style>
    </div>
  );
}