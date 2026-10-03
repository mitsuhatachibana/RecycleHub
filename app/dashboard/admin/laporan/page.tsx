'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  Search, 
  Eye, 
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  MapPin,
  FileText,
  RefreshCw,
  TrendingUp,
  ShoppingBag,
} from 'lucide-react';
import { LogoutButton } from '@/app/components/UI/LogoutButton';
import { Breadcrumb } from '@/app/components/UI/Breadcrumb';

interface Laporan {
  id: string;
  berat: number;
  deskripsi: string | null;
  status: 'MENUNGGU' | 'DIPROSES' | 'SELESAI' | 'DITOLAK';
  tanggalLapor: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    nama: string;
    email: string;
    noHp: string;
  };
  jenisSampah: {
    id: string;
    namaJenis: string;
    hargaPerKg: number;
  };
  wilayah: {
    id: string;
    namaWilayah: string;
  };
  FotoSampah: {
    id: string;
    urlFoto: string;
  }[];
  Transaksi: {
    id: string;
    totalHarga: number;
    status: string;
  } | null;
}

interface Stats {
  total: number;
  menunggu: number;
  diproses: number;
  selesai: number;
  ditolak: number;
  totalBerat: number;
}

export default function AdminLaporanPage() {
  const router = useRouter();
  const [laporan, setLaporan] = useState<Laporan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLaporan, setTotalLaporan] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedLaporan, setSelectedLaporan] = useState<Laporan | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    menunggu: 0,
    diproses: 0,
    selesai: 0,
    ditolak: 0,
    totalBerat: 0,
  });
  const [sortBy, setSortBy] = useState('newest');
  const [showFilter, setShowFilter] = useState(false);
  const [redeemStats, setRedeemStats] = useState({ pending: 0, total: 0 });
  const [loadingRedeemStats, setLoadingRedeemStats] = useState(true);

  const statusConfig = {
    MENUNGGU: {
      label: 'Menunggu',
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      icon: Clock,
      border: 'border-yellow-200'
    },
    DIPROSES: {
      label: 'Diproses',
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      icon: RefreshCw,
      border: 'border-blue-200'
    },
    SELESAI: {
      label: 'Selesai',
      bg: 'bg-green-100',
      text: 'text-green-800',
      icon: CheckCircle,
      border: 'border-green-200'
    },
    DITOLAK: {
      label: 'Ditolak',
      bg: 'bg-red-100',
      text: 'text-red-800',
      icon: XCircle,
      border: 'border-red-200'
    },
  };

  const fetchLaporan = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(searchTerm && { search: searchTerm }),
        ...(filterStatus && { status: filterStatus }),
        ...(sortBy && { sort: sortBy }),
      });
      
      const res = await fetch(`/api/laporan/admin?${params}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Gagal mengambil data');
      }
      const data = await res.json();
      setLaporan(data.data || []);
      setTotalPages(data.totalPages || 1);
      setTotalLaporan(data.total || 0);
      setStats(data.stats || {
        total: 0,
        menunggu: 0,
        diproses: 0,
        selesai: 0,
        ditolak: 0,
        totalBerat: 0,
      });
    } catch (error) {
      console.error('Error fetching laporan:', error);
      setError(error instanceof Error ? error.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, filterStatus, sortBy]);

  const fetchRedeemStats = useCallback(async () => {
    setLoadingRedeemStats(true);
    try {
      const res = await fetch('/api/redeem?limit=1');
      if (res.ok) {
        const data = await res.json();
        const pending = (data.data || []).filter((r: any) => r.status === 'PENDING').length;
        setRedeemStats({ pending, total: data.total || 0 });
      }
    } catch (error) {
      console.error('Error fetching redeem stats:', error);
    } finally {
      setLoadingRedeemStats(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      if (!mounted) return;
      await fetchLaporan();
      await fetchRedeemStats();
    };
    void run();
    return () => { mounted = false; };
  }, [fetchLaporan, fetchRedeemStats]);

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/laporan/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
        credentials: 'same-origin',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Gagal update status');
      }

      setSuccess(`Status laporan berhasil diupdate menjadi ${statusConfig[status as keyof typeof statusConfig].label}`);
      fetchLaporan();

      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Terjadi kesalahan');
    }
  };

  const handleDelete = async () => {
    if (!selectedLaporan) return;
    
    try {
      const res = await fetch(`/api/laporan/${selectedLaporan.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Gagal menghapus laporan');
      }

      setSuccess('Laporan berhasil dihapus');
      setIsDeleteModalOpen(false);
      setSelectedLaporan(null);
      fetchLaporan();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Terjadi kesalahan');
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <Breadcrumb items={[
        { label: 'Laporan', href: '/dashboard/admin/laporan' }
      ]} />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Monitoring Laporan</h1>
          <p className="text-sm text-gray-500 mt-1">
            Pantau dan kelola semua laporan sampah dari user
          </p>
        </div>
        <button
          onClick={fetchLaporan}
          className="w-full md:w-auto px-5 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
        <LogoutButton variant="icon" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Total</p>
              <p className="text-xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="p-2 bg-gray-100 rounded-lg">
              <FileText className="w-4 h-4 text-gray-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-yellow-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-yellow-600">Menunggu</p>
              <p className="text-xl font-bold text-yellow-600">{stats.menunggu}</p>
            </div>
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-4 h-4 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-blue-600">Diproses</p>
              <p className="text-xl font-bold text-blue-600">{stats.diproses}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <RefreshCw className="w-4 h-4 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-green-600">Selesai</p>
              <p className="text-xl font-bold text-green-600">{stats.selesai}</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-red-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-red-600">Ditolak</p>
              <p className="text-xl font-bold text-red-600">{stats.ditolak}</p>
            </div>
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="w-4 h-4 text-red-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-purple-600">Total Berat</p>
              <p className="text-xl font-bold text-purple-600">{stats.totalBerat} kg</p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="w-4 h-4 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-orange-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-orange-600">Penukaran Pending</p>
              <p className="text-xl font-bold text-orange-600">{loadingRedeemStats ? '...' : redeemStats.pending}</p>
            </div>
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="w-4 h-4 text-orange-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-indigo-100">
          <div className="flex items-center justify-between cursor-pointer" onClick={() => router.push('/dashboard/admin/redeem')}>
            <div>
              <p className="text-xs text-indigo-600">Total Penukaran</p>
              <p className="text-xl font-bold text-indigo-600">{loadingRedeemStats ? '...' : redeemStats.total}</p>
              <p className="text-xs text-indigo-400">Kelola penukaran</p>
            </div>
            <div className="p-2 bg-indigo-100 rounded-lg">
              <ShoppingBag className="w-4 h-4 text-indigo-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari laporan (user, jenis sampah, wilayah)..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition bg-gray-50/50 hover:bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilter(!showFilter)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filter</span>
            </button>
            
            <select
              className="px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50/50 hover:bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Terbaru</option>
              <option value="oldest">Terlama</option>
              <option value="berat_asc">Berat (Rendah)</option>
              <option value="berat_desc">Berat (Tinggi)</option>
            </select>
          </div>
        </div>

        {showFilter && (
          <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-2">
            <button
              onClick={() => setFilterStatus('')}
              className={`px-3 py-1.5 rounded-full text-sm transition ${
                !filterStatus 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Semua
            </button>
            {Object.entries(statusConfig).map(([key, config]) => (
              <button
                key={key}
                onClick={() => setFilterStatus(key)}
                className={`px-3 py-1.5 rounded-full text-sm transition ${
                  filterStatus === key
                    ? `${config.bg} ${config.text}`
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {config.label}
              </button>
            ))}
            <button
              onClick={() => {
                setFilterStatus('');
                setSearchTerm('');
                setSortBy('newest');
              }}
              className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 transition"
            >
              Reset
            </button>
          </div>
        )}
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-slideDown">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
          <button onClick={() => setError('')} className="ml-auto text-red-500 hover:text-red-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3 animate-slideDown">
          <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
          <p className="text-sm text-green-700">{success}</p>
          <button onClick={() => setSuccess('')} className="ml-auto text-green-500 hover:text-green-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Laporan
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  User
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                  Wilayah
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Berat
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                  Tanggal
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-green-500 mx-auto" />
                    <p className="text-gray-500 mt-2">Memuat data...</p>
                  </td>
                </tr>
              ) : laporan.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <div className="text-6xl mb-4">📋</div>
                    <p className="text-gray-500">Tidak ada laporan ditemukan</p>
                  </td>
                </tr>
              ) : (
                laporan.map((item) => {
                  const status = statusConfig[item.status];
                  const StatusIcon = status.icon;
                  
                  return (
                    <tr key={item.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {item.jenisSampah.namaJenis}
                          </p>
                          <p className="text-xs text-gray-500 truncate max-w-37.5">
                            {item.deskripsi || 'Tidak ada deskripsi'}
                          </p>
                          {item.FotoSampah && item.FotoSampah.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {item.FotoSampah.slice(0, 3).map((foto) => (
                                <Image
                                  key={foto.id}
                                  src={foto.urlFoto}
                                  alt="Foto"
                                  width={24}
                                  height={24}
                                  unoptimized
                                  className="w-6 h-6 rounded object-cover"
                                />
                              ))}
                              {item.FotoSampah.length > 3 && (
                                <span className="text-xs text-gray-400">+{item.FotoSampah.length - 3}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <div>
                          <p className="text-sm text-gray-900">{item.user.nama}</p>
                          <p className="text-xs text-gray-500">{item.user.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="text-sm text-gray-600 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {item.wilayah.namaWilayah}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-semibold text-gray-900">
                          {item.berat} kg
                        </span>
                        {item.Transaksi && (
                          <p className="text-xs text-green-600">
                            {formatCurrency(item.Transaksi.totalHarga)}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium w-fit ${status.bg} ${status.text}`}>
                            <StatusIcon className="w-3 h-3" />
                            {status.label}
                          </span>
                          {item.status === 'MENUNGGU' && (
                            <select
                              onChange={(e) => handleStatusUpdate(item.id, e.target.value)}
                              className="text-xs border border-gray-200 rounded px-1 py-0.5 bg-white"
                              value={item.status}
                            >
                              <option value="MENUNGGU">Menunggu</option>
                              <option value="DIPROSES">Diproses</option>
                              <option value="SELESAI">Selesai</option>
                              <option value="DITOLAK">Ditolak</option>
                            </select>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <div className="text-xs text-gray-500">
                          <div>{formatDate(item.createdAt)}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => {
                              setSelectedLaporan(item);
                              setIsDetailModalOpen(true);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Detail Laporan"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedLaporan(item);
                              setIsDeleteModalOpen(true);
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Hapus Laporan"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
          <p className="text-sm text-gray-500">
            Menampilkan {laporan.length} dari {totalLaporan} laporan
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 border border-gray-200 rounded-xl disabled:opacity-50 hover:bg-gray-50 transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-10 h-10 rounded-xl transition ${
                      currentPage === pageNum
                        ? 'bg-green-600 text-white'
                        : 'border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 border border-gray-200 rounded-xl disabled:opacity-50 hover:bg-gray-50 transition"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {isDetailModalOpen && selectedLaporan && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Detail Laporan</h2>
              <button
                onClick={() => {
                  setIsDetailModalOpen(false);
                  setSelectedLaporan(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Status */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium mt-1 ${
                    statusConfig[selectedLaporan.status].bg
                  } ${statusConfig[selectedLaporan.status].text}`}>
                    {(() => {
                      const Icon = statusConfig[selectedLaporan.status].icon;
                      return <Icon className="w-4 h-4" />;
                    })()}
                    {statusConfig[selectedLaporan.status].label}
                  </div>
                </div>
                {selectedLaporan.status === 'MENUNGGU' && (
                  <select
                    onChange={(e) => {
                      handleStatusUpdate(selectedLaporan.id, e.target.value);
                      setIsDetailModalOpen(false);
                    }}
                    className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm"
                    value={selectedLaporan.status}
                  >
                    <option value="MENUNGGU">Menunggu</option>
                    <option value="DIPROSES">Diproses</option>
                    <option value="SELESAI">Selesai</option>
                    <option value="DITOLAK">Ditolak</option>
                  </select>
                )}
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500">Jenis Sampah</p>
                  <p className="font-medium">{selectedLaporan.jenisSampah.namaJenis}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500">Berat</p>
                  <p className="font-medium">{selectedLaporan.berat} kg</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500">Wilayah</p>
                  <p className="font-medium">{selectedLaporan.wilayah.namaWilayah}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500">Tanggal Lapor</p>
                  <p className="font-medium">{formatDate(selectedLaporan.createdAt)}</p>
                </div>
              </div>

              {/* User Info */}
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500">Pelapor</p>
                <div className="flex items-center gap-3 mt-1">
                  <div className="w-10 h-10 rounded-full bg-linar-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-semibold">
                    {selectedLaporan.user.nama.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium">{selectedLaporan.user.nama}</p>
                    <p className="text-sm text-gray-500">{selectedLaporan.user.email}</p>
                    <p className="text-sm text-gray-500">{selectedLaporan.user.noHp}</p>
                  </div>
                </div>
              </div>

              {/* Deskripsi */}
              {selectedLaporan.deskripsi && (
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500">Deskripsi</p>
                  <p className="mt-1 text-gray-700">{selectedLaporan.deskripsi}</p>
                </div>
              )}

              {/* Foto */}
              {selectedLaporan.FotoSampah && selectedLaporan.FotoSampah.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-2">Foto Sampah</p>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedLaporan.FotoSampah.map((foto) => (
                      <Image
                        key={foto.id}
                        src={foto.urlFoto}
                        alt="Foto sampah"
                        width={200}
                        height={128}
                        unoptimized
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Transaksi */}
              {selectedLaporan.Transaksi && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">Total Transaksi</p>
                      <p className="text-xl font-bold text-green-600">
                        {formatCurrency(selectedLaporan.Transaksi.totalHarga)}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      selectedLaporan.Transaksi.status === 'SELESAI'
                        ? 'bg-green-200 text-green-700'
                        : 'bg-yellow-200 text-yellow-700'
                    }`}>
                      {selectedLaporan.Transaksi.status}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && selectedLaporan && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Hapus Laporan</h3>
              <p className="text-gray-600">
                Apakah Anda yakin ingin menghapus laporan dari{' '}
                <strong>{selectedLaporan.user.nama}</strong>?
              </p>
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
                <p className="text-sm text-yellow-700">
                  ⚠️ Tindakan ini tidak dapat dibatalkan
                </p>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setSelectedLaporan(null);
                  }}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition"
                >
                  Batal
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}