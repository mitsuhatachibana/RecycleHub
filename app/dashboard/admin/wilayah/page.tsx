'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Loader2,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Building,
  Hash,
  Globe
} from 'lucide-react';
import { LogoutButton } from '@/app/components/UI/LogoutButton';
import { Breadcrumb } from '@/app/components/UI/Breadcrumb';

interface Wilayah {
  id: string;
  namaWilayah: string;
  kodePos: string | null;
  createdAt: string;
  updatedAt: string;
  _count: {
    LaporanSampah: number;
  };
}

interface WilayahFormData {
  id?: string;
  namaWilayah: string;
  kodePos: string;
}

export default function AdminWilayahPage() {
  const [wilayah, setWilayah] = useState<Wilayah[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedWilayah, setSelectedWilayah] = useState<Wilayah | null>(null);
  const [formData, setFormData] = useState<WilayahFormData>({
    namaWilayah: '',
    kodePos: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalWilayah, setTotalWilayah] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState('newest');

  const fetchWilayahData = async (page: number, search: string, sort: string) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: '10',
      ...(search && { search }),
      ...(sort && { sort }),
    });

    const res = await fetch(`/api/wilayah?${params}`);
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Gagal mengambil data');
    }

    return res.json();
  };

  const fetchWilayah = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchWilayahData(currentPage, searchTerm, sortBy);
      setWilayah(data.data || []);
      setTotalPages(data.totalPages || 1);
      setTotalWilayah(data.total || 0);
    } catch (error) {
      console.error('Error fetching wilayah:', error);
      setError(error instanceof Error ? error.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadWilayah = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await fetchWilayahData(currentPage, searchTerm, sortBy);
        setWilayah(data.data || []);
        setTotalPages(data.totalPages || 1);
        setTotalWilayah(data.total || 0);
      } catch (error) {
        console.error('Error fetching wilayah:', error);
        setError(error instanceof Error ? error.message : 'Terjadi kesalahan');
      } finally {
        setLoading(false);
      }
    };

    loadWilayah();
  }, [currentPage, searchTerm, sortBy]);

  const resetForm = () => {
    setFormData({
      namaWilayah: '',
      kodePos: '',
    });
    setSelectedWilayah(null);
    setError('');
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (item: Wilayah) => {
    setSelectedWilayah(item);
    setFormData({
      id: item.id,
      namaWilayah: item.namaWilayah,
      kodePos: item.kodePos || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      if (!formData.namaWilayah.trim()) {
        throw new Error('Nama wilayah harus diisi');
      }

      const url = formData.id ? `/api/wilayah/${formData.id}` : '/api/wilayah';
      const method = formData.id ? 'PUT' : 'POST';
      
      const submitData = {
        namaWilayah: formData.namaWilayah.trim(),
        kodePos: formData.kodePos.trim() || null,
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Gagal menyimpan wilayah');
      }

      setSuccess(formData.id ? 'Wilayah berhasil diupdate' : 'Wilayah berhasil ditambahkan');
      setIsModalOpen(false);
      resetForm();
      
      setTimeout(() => {
        fetchWilayah();
        setSuccess('');
      }, 2000);
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Terjadi kesalahan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedWilayah) return;
    
    try {
      const res = await fetch(`/api/wilayah/${selectedWilayah.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Gagal menghapus wilayah');
      }

      setSuccess('Wilayah berhasil dihapus');
      setIsDeleteModalOpen(false);
      setSelectedWilayah(null);
      
      setTimeout(() => {
        fetchWilayah();
        setSuccess('');
      }, 2000);
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Terjadi kesalahan');
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <Breadcrumb items={[
        { label: 'Wilayah', href: '/dashboard/admin/wilayah' }
      ]} />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Manajemen Wilayah</h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola wilayah untuk pengelolaan sampah
          </p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button
            onClick={fetchWilayah}
            className="px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={openCreateModal}
            className="flex-1 md:flex-none bg-linear-to-r from-green-600 to-emerald-600 text-white px-5 py-2.5 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-green-500/25"
          >
            <Plus className="w-5 h-5" />
            <span>Tambah Wilayah</span>
          </button>
          <LogoutButton variant="icon" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Wilayah</p>
              <p className="text-2xl font-bold text-gray-900">{totalWilayah}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-xl">
              <MapPin className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Dengan Laporan</p>
              <p className="text-2xl font-bold text-blue-600">
                {wilayah.filter(w => w._count.LaporanSampah > 0).length}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <Building className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Laporan</p>
              <p className="text-2xl font-bold text-purple-600">
                {wilayah.reduce((acc, w) => acc + w._count.LaporanSampah, 0)}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-xl">
              <Globe className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari wilayah..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition bg-gray-50/50 hover:bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select
            className="px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50/50 hover:bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Terbaru</option>
            <option value="oldest">Terlama</option>
            <option value="name">Nama A-Z</option>
            <option value="name_desc">Nama Z-A</option>
            <option value="popular">Terpopuler</option>
          </select>
        </div>
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
                  Wilayah
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                  Kode Pos
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Laporan
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                  Dibuat
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-green-500 mx-auto" />
                    <p className="text-gray-500 mt-2">Memuat data...</p>
                  </td>
                </tr>
              ) : wilayah.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12">
                    <div className="text-6xl mb-4">📍</div>
                    <p className="text-gray-500">Tidak ada wilayah ditemukan</p>
                    <button
                      onClick={openCreateModal}
                      className="mt-3 text-green-600 hover:text-green-700 font-medium"
                    >
                      Tambah wilayah baru
                    </button>
                  </td>
                </tr>
              ) : (
                wilayah.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-linear-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                          <MapPin className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {item.namaWilayah}
                          </p>
                          {item.kodePos && (
                            <p className="text-xs text-gray-500 sm:hidden">
                              Kode Pos: {item.kodePos}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      {item.kodePos ? (
                        <span className="text-sm font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">
                          {item.kodePos}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${
                          item._count.LaporanSampah > 0 ? 'text-green-600' : 'text-gray-400'
                        }`}>
                          {item._count.LaporanSampah}
                        </span>
                        <span className="text-xs text-gray-400">laporan</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-sm text-gray-500">
                        {formatDate(item.createdAt)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Edit Wilayah"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedWilayah(item);
                            setIsDeleteModalOpen(true);
                          }}
                          className={`p-2 rounded-lg transition ${
                            item._count.LaporanSampah > 0
                              ? 'text-gray-400 cursor-not-allowed'
                              : 'text-red-600 hover:bg-red-50'
                          }`}
                          title={item._count.LaporanSampah > 0 ? 'Wilayah memiliki laporan, tidak bisa dihapus' : 'Hapus Wilayah'}
                          disabled={item._count.LaporanSampah > 0}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
          <p className="text-sm text-gray-500">
            Menampilkan {wilayah.length} dari {totalWilayah} wilayah
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

      {/* Modal Create/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="border-b border-gray-100 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                {formData.id ? 'Edit Wilayah' : 'Tambah Wilayah Baru'}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Nama Wilayah <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    required
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition bg-gray-50/50"
                    placeholder="Contoh: Jakarta Pusat"
                    value={formData.namaWilayah}
                    onChange={(e) => setFormData({ ...formData, namaWilayah: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Kode Pos
                </label>
                <div className="relative">
                  <Hash className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition bg-gray-50/50 font-mono"
                    placeholder="Contoh: 10110"
                    value={formData.kodePos}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      setFormData({ ...formData, kodePos: value });
                    }}
                    maxLength={10}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">Hanya angka (opsional)</p>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 bg-linear-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-green-500/25"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    formData.id ? 'Update Wilayah' : 'Simpan Wilayah'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && selectedWilayah && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Hapus Wilayah</h3>
              <p className="text-gray-600">
                Apakah Anda yakin ingin menghapus wilayah{' '}
                <strong>{selectedWilayah.namaWilayah}</strong>?
              </p>
              {selectedWilayah._count.LaporanSampah > 0 && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
                  <p className="text-sm text-yellow-700">
                    ⚠️ Wilayah ini memiliki {selectedWilayah._count.LaporanSampah} laporan dan tidak dapat dihapus.
                  </p>
                </div>
              )}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setSelectedWilayah(null);
                  }}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition"
                >
                  Batal
                </button>
                <button
                  onClick={handleDelete}
                  disabled={selectedWilayah._count.LaporanSampah > 0}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
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