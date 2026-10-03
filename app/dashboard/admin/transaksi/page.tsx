'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  Eye, 
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
  Download,
  RefreshCw,
  TrendingUp,
  Wallet,
  Receipt,
  Printer
} from 'lucide-react';
import { LogoutButton } from '@/app/components/UI/LogoutButton';
import { Breadcrumb } from '@/app/components/UI/Breadcrumb';
import Image from 'next/image';

interface Transaksi {
  id: string;
  totalHarga: number;
  status: 'PENDING' | 'SELESAI' | 'BATAL';
  tanggalTransaksi: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    nama: string;
    email: string;
    noHp: string;
  };
  laporan: {
    id: string;
    berat: number;
    deskripsi: string | null;
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
      deskripsi?: string | null;
    }[];
  };
}

interface Stats {
  total: number;
  totalPendapatan: number;
  selesai: number;
  pending: number;
  batal: number;
  rataRata: number;
}

export default function AdminTransaksiPage() {
  const [transaksi, setTransaksi] = useState<Transaksi[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTransaksi, setTotalTransaksi] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedTransaksi, setSelectedTransaksi] = useState<Transaksi | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    totalPendapatan: 0,
    selesai: 0,
    pending: 0,
    batal: 0,
    rataRata: 0,
  });
  const [sortBy, setSortBy] = useState('newest');
  const [showFilter, setShowFilter] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const statusConfig = {
    PENDING: {
      label: 'Pending',
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      icon: Clock,
      border: 'border-yellow-200'
    },
    SELESAI: {
      label: 'Selesai',
      bg: 'bg-green-100',
      text: 'text-green-800',
      icon: CheckCircle,
      border: 'border-green-200'
    },
    BATAL: {
      label: 'Batal',
      bg: 'bg-red-100',
      text: 'text-red-800',
      icon: XCircle,
      border: 'border-red-200'
    },
  };

  const fetchTransaksi = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(searchTerm && { search: searchTerm }),
        ...(filterStatus && { status: filterStatus }),
        ...(sortBy && { sort: sortBy }),
        ...(dateRange.start && { startDate: dateRange.start }),
        ...(dateRange.end && { endDate: dateRange.end }),
      });
      
      const res = await fetch(`/api/transaksi/admin?${params}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Gagal mengambil data');
      }
      const data = await res.json();
      setTransaksi(data.data || []);
      setTotalPages(data.totalPages || 1);
      setTotalTransaksi(data.total || 0);
      setStats(data.stats || {
        total: 0,
        totalPendapatan: 0,
        selesai: 0,
        pending: 0,
        batal: 0,
        rataRata: 0,
      });
    } catch (error) {
      console.error('Error fetching transaksi:', error);
      setError(error instanceof Error ? error.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, filterStatus, sortBy, dateRange]);

  useEffect(() => {
    const loadTransaksi = async () => {
      await fetchTransaksi();
    };

    void loadTransaksi();
  }, [fetchTransaksi]);

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

  const exportCSV = () => {
    if (transaksi.length === 0) return;
    
    const headers = ['ID', 'User', 'Jenis Sampah', 'Berat', 'Total Harga', 'Status', 'Tanggal'];
    const rows = transaksi.map(t => [
      t.id.substring(0, 8),
      t.user.nama,
      t.laporan.jenisSampah.namaJenis,
      t.laporan.berat + ' kg',
      formatCurrency(t.totalHarga),
      statusConfig[t.status].label,
      formatDate(t.createdAt)
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transaksi_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <Breadcrumb items={[
        { label: 'Transaksi', href: '/dashboard/admin/transaksi' }
      ]} />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Manajemen Transaksi</h1>
          <p className="text-sm text-gray-500 mt-1">
            Pantau semua transaksi daur ulang sampah
          </p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button
            onClick={fetchTransaksi}
            className="px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={exportCSV}
            className="px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition flex items-center justify-center gap-2 shadow-lg shadow-green-500/25"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          <LogoutButton variant="icon" />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Total Transaksi</p>
              <p className="text-xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="p-2 bg-gray-100 rounded-lg">
              <Receipt className="w-4 h-4 text-gray-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-green-600">Total Pendapatan</p>
              <p className="text-xl font-bold text-green-600">
                {formatCurrency(stats.totalPendapatan)}
              </p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <Wallet className="w-4 h-4 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-yellow-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-yellow-600">Pending</p>
              <p className="text-xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-4 h-4 text-yellow-600" />
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
        <div className="bg-white rounded-xl shadow-sm p-4 border border-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-purple-600">Rata-rata</p>
              <p className="text-xl font-bold text-purple-600">
                {formatCurrency(stats.rataRata)}
              </p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="w-4 h-4 text-purple-600" />
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
              placeholder="Cari transaksi (user, jenis sampah)..."
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
              <option value="highest">Nilai Tertinggi</option>
              <option value="lowest">Nilai Terendah</option>
            </select>
          </div>
        </div>

        {showFilter && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex flex-wrap gap-3">
              <div className="flex flex-wrap gap-2">
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
              </div>
              
              <div className="flex items-center gap-2 ml-auto">
                <input
                  type="date"
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                />
                <span className="text-gray-400">-</span>
                <input
                  type="date"
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                />
                <button
                  onClick={() => {
                    setDateRange({ start: '', end: '' });
                    setFilterStatus('');
                    setSearchTerm('');
                    setSortBy('newest');
                  }}
                  className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 transition"
                >
                  Reset
                </button>
              </div>
            </div>
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
                  Transaksi
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  User
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                  Jenis Sampah
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
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
              ) : transaksi.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <div className="text-6xl mb-4">💳</div>
                    <p className="text-gray-500">Tidak ada transaksi ditemukan</p>
                  </td>
                </tr>
              ) : (
                transaksi.map((item) => {
                  const status = statusConfig[item.status];
                  const StatusIcon = status.icon;
                  
                  return (
                    <tr key={item.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            #{item.id.substring(0, 8)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {item.laporan.berat} kg • {item.laporan.wilayah.namaWilayah}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <div>
                          <p className="text-sm text-gray-900">{item.user.nama}</p>
                          <p className="text-xs text-gray-500">{item.user.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="text-sm text-gray-600">
                          {item.laporan.jenisSampah.namaJenis}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-semibold text-green-600">
                          {formatCurrency(item.totalHarga)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <div className="text-xs text-gray-500">
                          {formatDate(item.createdAt)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => {
                              setSelectedTransaksi(item);
                              setIsDetailModalOpen(true);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Detail Transaksi"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              // Print receipt
                              window.print();
                            }}
                            className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition"
                            title="Print Receipt"
                          >
                            <Printer className="w-4 h-4" />
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
            Menampilkan {transaksi.length} dari {totalTransaksi} transaksi
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
      {isDetailModalOpen && selectedTransaksi && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Detail Transaksi</h2>
              <button
                onClick={() => {
                  setIsDetailModalOpen(false);
                  setSelectedTransaksi(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="text-center pb-6 border-b border-gray-100">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Receipt className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">RecycleHub</h3>
                <p className="text-sm text-gray-500">Transaksi #{selectedTransaksi.id.substring(0, 8)}</p>
              </div>

              {/* Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500">Status</p>
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium mt-1 ${
                    statusConfig[selectedTransaksi.status].bg
                  } ${statusConfig[selectedTransaksi.status].text}`}>
                    {(() => {
                      const Icon = statusConfig[selectedTransaksi.status].icon;
                      return <Icon className="w-4 h-4" />;
                    })()}
                    {statusConfig[selectedTransaksi.status].label}
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500">Total Harga</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(selectedTransaksi.totalHarga)}
                  </p>
                </div>
              </div>

              {/* User Info */}
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500">Pelapor</p>
                <div className="flex items-center gap-3 mt-1">
                  <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-400 to-blue-500 flex items-center justify-center text-white font-semibold">
                    {selectedTransaksi.user.nama.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium">{selectedTransaksi.user.nama}</p>
                    <p className="text-sm text-gray-500">{selectedTransaksi.user.email}</p>
                    <p className="text-sm text-gray-500">{selectedTransaksi.user.noHp}</p>
                  </div>
                </div>
              </div>

              {/* Laporan Info */}
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500">Detail Laporan</p>
                <div className="mt-2 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Jenis Sampah</span>
                    <span className="font-medium">{selectedTransaksi.laporan.jenisSampah.namaJenis}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Berat</span>
                    <span className="font-medium">{selectedTransaksi.laporan.berat} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Harga/kg</span>
                    <span className="font-medium">{formatCurrency(selectedTransaksi.laporan.jenisSampah.hargaPerKg)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Wilayah</span>
                    <span className="font-medium">{selectedTransaksi.laporan.wilayah.namaWilayah}</span>
                  </div>
                  {selectedTransaksi.laporan.deskripsi && (
                    <div>
                      <span className="text-gray-600">Deskripsi</span>
                      <p className="text-sm text-gray-700 mt-1">{selectedTransaksi.laporan.deskripsi}</p>
                    </div>
                  )}
                </div>
              </div>

              {selectedTransaksi.laporan.FotoSampah && selectedTransaksi.laporan.FotoSampah.length > 0 && (
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 mb-2">Foto Sampah</p>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedTransaksi.laporan.FotoSampah.map((foto) => (
                      <div key={foto.id} className="relative">
                        <Image
                          src={foto.urlFoto}
                          alt="Foto sampah"
                          width={200}
                          height={128}
                          unoptimized
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500">Dibuat</p>
                  <p className="font-medium">{formatDate(selectedTransaksi.createdAt)}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500">Terakhir Update</p>
                  <p className="font-medium">{formatDate(selectedTransaksi.updatedAt)}</p>
                </div>
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
        @media print {
          .p-4, .p-6, .px-6, .py-4 {
            padding: 0 !important;
          }
          .border, .shadow-2xl {
            border: none !important;
            box-shadow: none !important;
          }
          .bg-gray-50, .bg-white {
            background: white !important;
          }
        }
      `}</style>
    </div>
  );
}