'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Trash2,
  Eye,
  Plus,
  Search,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  MapPin,
  Package,
  Calendar,
  DollarSign,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Edit2,
  Pencil,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Upload,
  Coins,
  ShoppingBag,
} from 'lucide-react';
import { Toast } from '@/app/components/UI/Toast';
import { LogoutButton } from '@/app/components/UI/LogoutButton';
import { Breadcrumb } from '@/app/components/UI/Breadcrumb';

interface Laporan {
  id: string;
  berat: number;
  deskripsi: string | null;
  status: 'MENUNGGU' | 'DIPROSES' | 'SELESAI' | 'DITOLAK';
  createdAt: string;
  updatedAt: string;
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

interface JenisSampahPopuler {
  id: string;
  namaJenis: string;
  _count: {
    LaporanSampah: number;
  };
}

interface User {
  id: string;
  nama: string;
  email: string;
  role: string;
}

export default function UserLaporanPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [laporan, setLaporan] = useState<Laporan[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedLaporan, setSelectedLaporan] = useState<Laporan | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [jenisSampahPopuler, setJenisSampahPopuler] = useState<JenisSampahPopuler[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingLaporan, setEditingLaporan] = useState<Laporan | null>(null);
  const [editFormData, setEditFormData] = useState({
    jenisSampahId: '',
    wilayahId: '',
    berat: '',
    deskripsi: '',
  });
  const [editPhotos, setEditPhotos] = useState<{ id: string; urlFoto: string }[]>([]);
  const [removedPhotoIds, setRemovedPhotoIds] = useState<string[]>([]);
  const [editNewPhotos, setEditNewPhotos] = useState<File[]>([]);
  const [editNewPreviews, setEditNewPreviews] = useState<string[]>([]);
  const [uploadingEditPhoto, setUploadingEditPhoto] = useState(false);
  const editPhotoInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [poin, setPoin] = useState<{ jumlahPoin: number; totalPoinDikumpulkan: number } | null>(null);
  const [loadingPoin, setLoadingPoin] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxPhotos, setLightboxPhotos] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [jenisSampahList, setJenisSampahList] = useState<{ id: string; namaJenis: string }[]>([]);
  const [wilayahList, setWilayahList] = useState<{ id: string; namaWilayah: string }[]>([]);

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

  const statusConfig = {
    MENUNGGU: {
      label: 'Menunggu',
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      icon: Clock,
    },
    DIPROSES: {
      label: 'Diproses',
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      icon: RefreshCw,
    },
    SELESAI: {
      label: 'Selesai',
      bg: 'bg-green-100',
      text: 'text-green-800',
      icon: CheckCircle,
    },
    DITOLAK: {
      label: 'Ditolak',
      bg: 'bg-red-100',
      text: 'text-red-800',
      icon: XCircle,
    },
  };

  const StatusIcon = ({ status }: { status: keyof typeof statusConfig }) => {
    const Icon = statusConfig[status].icon;
    return <Icon className="w-3 h-3" />;
  };

  useEffect(() => {
    let mounted = true;
    const checkSession = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          router.push('/login');
          return;
        }
        const userData = await res.json();
        if (mounted) setUser(userData);
      } catch {
        if (mounted) router.push('/login');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void checkSession();
  }, [router]);

  const fetchLaporan = useCallback(async () => {
    setError('');
    try {
      const [laporanRes, statsRes, jenisRes, wilayahRes, poinRes] = await Promise.all([
        fetch('/api/laporan'),
        fetch('/api/dashboard/stats'),
        fetch('/api/jenis-sampah'),
        fetch('/api/wilayah?limit=100'),
        fetch('/api/poin'),
      ]);

      if (laporanRes.ok) {
        const data = await laporanRes.json();
        setLaporan(data || []);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setJenisSampahPopuler(statsData.jenisSampahPopuler || []);
      }

      if (jenisRes.ok) {
        const jenisData = await jenisRes.json();
        setJenisSampahList(jenisData);
      }

      if (wilayahRes.ok) {
        const wilayahData = await wilayahRes.json();
        setWilayahList(wilayahData.data || []);
      }

      if (poinRes.ok) {
        const poinData = await poinRes.json();
        setPoin({
          jumlahPoin: poinData.jumlahPoin || 0,
          totalPoinDikumpulkan: poinData.totalPoinDikumpulkan || 0,
        });
      }
    } catch (err) {
      console.error('Error fetching laporan:', err);
      setError('Gagal memuat data');
    } finally {
      setLoading(false);
      setLoadingPoin(false);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    let mounted = true;
    const run = async () => {
      if (!mounted) return;
      await fetchLaporan();
    };
    void run();
    return () => { mounted = false; };
  }, [user, fetchLaporan]);

  const handleRetry = () => {
    fetchLaporan();
  };

  const filteredLaporan = laporan.filter((l) => {
    const matchesSearch = searchTerm
      ? l.jenisSampah?.namaJenis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.wilayah?.namaWilayah?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.deskripsi?.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    const matchesStatus = filterStatus ? l.status === filterStatus : true;
    return matchesSearch && matchesStatus;
  });

  const sortedLaporan = [...filteredLaporan].sort((a, b) => {
    if (sortBy === 'oldest') {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const handleEdit = (laporan: Laporan) => {
    setEditingLaporan(laporan);
    setEditFormData({
      jenisSampahId: laporan.jenisSampah.id,
      wilayahId: laporan.wilayah.id,
      berat: laporan.berat.toString(),
      deskripsi: laporan.deskripsi || '',
    });
    setEditPhotos(laporan.FotoSampah || []);
    setRemovedPhotoIds([]);
    setEditNewPhotos([]);
    setEditNewPreviews([]);
    setIsEditModalOpen(true);
  };

  const removeEditPhoto = (id: string) => {
    setEditPhotos(prev => prev.filter(f => f.id !== id));
    setRemovedPhotoIds(prev => (prev.includes(id) ? prev : [...prev, id]));
  };

  const handleEditPhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(f => {
      if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(f.type)) {
        setError(`File "${f.name}" bukan format gambar yang didukung`);
        return false;
      }
      if (f.size > 5 * 1024 * 1024) {
        setError(`File "${f.name}" terlalu besar (maks 5MB)`);
        return false;
      }
      return true;
    });

    const newPreviews = validFiles.map(f => URL.createObjectURL(f));
    setEditNewPhotos(prev => [...prev, ...validFiles]);
    setEditNewPreviews(prev => [...prev, ...newPreviews]);
  };

  const uploadEditNewPhotos = async (laporanId: string) => {
    const files = [...editNewPhotos];
    const uploaded: { id: string; urlFoto: string }[] = [];
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('laporanId', laporanId);

      const res = await fetch('/api/foto-sampah/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Gagal upload foto');
      }

      const foto = await res.json();
      uploaded.push({ id: foto.id, urlFoto: foto.urlFoto });
    }
    setEditPhotos(prev => [...prev, ...uploaded]);
    setEditNewPhotos([]);
    setEditNewPreviews([]);
    return uploaded;
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLaporan) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/laporan/${editingLaporan.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal memperbarui laporan');

      if (editNewPhotos.length > 0) {
        await uploadEditNewPhotos(data.id);
      }

      for (const pid of removedPhotoIds) {
        await fetch(`/api/foto-sampah/${pid}`, { method: 'DELETE' }).catch(() => {});
      }

      const photosArray = Array.isArray(editPhotos) ? editPhotos : [];
      setLaporan(prev => prev.map(l => l.id === editingLaporan.id ? { ...data, FotoSampah: photosArray } : l));
      setSelectedLaporan(data);
      setIsEditModalOpen(false);
      setEditingLaporan(null);
      setEditPhotos([]);
      setRemovedPhotoIds([]);
      setEditNewPhotos([]);
      setEditNewPreviews([]);
      setSuccess('Laporan berhasil diperbarui');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeletingId(id);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/laporan/${deletingId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Gagal menghapus laporan');
      }

      setLaporan(prev => prev.filter(l => l.id !== deletingId));
      setIsDeleteModalOpen(false);
      setDeletingId(null);
      setSuccess('Laporan berhasil dihapus');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setDeleting(false);
    }
  };

  const openLightbox = (photos: string[], index: number) => {
    setLightboxPhotos(photos);
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const nextPhoto = () => {
    setLightboxIndex(prev => (prev + 1) % lightboxPhotos.length);
  };

  const prevPhoto = () => {
    setLightboxIndex(prev => (prev - 1 + lightboxPhotos.length) % lightboxPhotos.length);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-green-50 via-emerald-50 to-teal-50">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-green-600 mx-auto mb-3" />
          <p className="text-gray-600">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 md:py-8">
      {success && (
        <Toast message={success} type="success" onClose={() => setSuccess('')} />
      )}
      {error && (
        <Toast message={error} type="error" onClose={() => setError('')} />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumb items={[
          { label: 'Laporan Saya', href: '/dashboard/user/laporan' }
        ]} />

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Laporan Saya</h1>
            <p className="text-sm text-gray-500 mt-1">
              Kelola semua laporan sampah Anda
            </p>
          </div>
          <button
            onClick={() => router.push('/dashboard/user/laporan/baru')}
            className="w-full md:w-auto px-5 py-2.5 bg-linear-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition flex items-center justify-center gap-2 shadow-lg shadow-green-500/25"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Laporan Baru</span>
          </button>
          <LogoutButton variant="text" />
        </div>

        {/* Poin & Reward Widget */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 md:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Poin Reward Saya</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {loadingPoin ? '...' : poin?.jumlahPoin || 0}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Tukar poin dengan reward menarik
                </p>
              </div>
              <button
                onClick={() => router.push('/dashboard/user/rewards')}
                className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition flex items-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Lihat Reward</span>
              </button>
            </div>
          </div>
          <div className="bg-linear-to-br from-yellow-50 to-orange-50 rounded-xl shadow-sm p-5 border border-yellow-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Coins className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-yellow-700">Total Poin Dikumpulkan</p>
                <p className="text-xl font-bold text-yellow-900">
                  {loadingPoin ? '...' : poin?.totalPoinDikumpulkan || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Jenis Sampah Populer */}
        {jenisSampahPopuler.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100">
            <h2 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              Jenis Sampah Populer
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {jenisSampahPopuler.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-lg px-3 py-2 shrink-0"
                >
                  <Package className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-gray-800">{item.namaJenis}</span>
                  <span className="text-xs text-gray-500">{item._count.LaporanSampah} laporan</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Total</p>
                <p className="text-xl font-bold text-gray-900">{laporan.length}</p>
              </div>
              <div className="p-2 bg-gray-100 rounded-lg">
                <Package className="w-4 h-4 text-gray-600" />
              </div>
            </div>
          </div>
          {Object.entries(statusConfig).map(([key, config]) => {
            const count = laporan.filter((l) => l.status === key).length;
            const Icon = config.icon;
            return (
              <div key={key} className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-xs ${config.text}`}>{config.label}</p>
                    <p className={`text-xl font-bold ${config.text}`}>{count}</p>
                  </div>
                  <div className={`p-2 rounded-lg ${config.bg}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Filter & Search */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari laporan (jenis sampah, wilayah, deskripsi)..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition bg-gray-50/50 hover:bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <div className="relative">
                <button
                  onClick={() => {}}
                  className="px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition flex items-center gap-2"
                >
                  <Filter className="w-4 h-4" />
                  <span className="hidden sm:inline">Filter</span>
                </button>

                {filterStatus && (
                  <div className="absolute top-full mt-2 left-0 z-10 bg-white border border-gray-200 rounded-xl shadow-lg p-2 min-w-[180px]">
                    {Object.entries(statusConfig).map(([key, config]) => (
                      <button
                        key={key}
                        onClick={() => setFilterStatus(key)}
                        className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition ${
                          filterStatus === key
                            ? `${config.bg} ${config.text}`
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <StatusIcon status={key as keyof typeof statusConfig} />
                        {config.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <select
                className="px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50/50 hover:bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">Semua Status</option>
                {Object.entries(statusConfig).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.label}
                  </option>
                ))}
              </select>

              <select
                className="px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50/50 hover:bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Terbaru</option>
                <option value="oldest">Terlama</option>
              </select>

              <button
                onClick={handleRetry}
                className="px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition flex items-center justify-center"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

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
                {sortedLaporan.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12">
                      <div className="text-6xl mb-4">📋</div>
                      <p className="text-gray-500">Belum ada laporan</p>
                      <p className="text-sm text-gray-400 mt-1">
                        Buat laporan pertama Anda
                      </p>
                      <button
                        onClick={() => router.push('/dashboard/user/laporan/baru')}
                        className="mt-4 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition inline-flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Buat Laporan
                      </button>
                    </td>
                  </tr>
                ) : (
                  sortedLaporan.map((item) => {
                    const status = statusConfig[item.status];
                    const StatusIconComp = status.icon;
                    const hasFoto = item.FotoSampah && item.FotoSampah.length > 0;

                    return (
                      <tr key={item.id} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                              <Package className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {item.jenisSampah.namaJenis}
                              </p>
                              <p className="text-xs text-gray-500 truncate max-w-[200px]">
                                {item.deskripsi || 'Tidak ada deskripsi'}
                              </p>
                              {hasFoto && (
                                <div className="flex gap-1 mt-1">
                                  {item.FotoSampah.slice(0, 3).map((foto) => (
                                    <img
                                      key={foto.id}
                                      src={foto.urlFoto}
                                      alt="Foto"
                                      className="w-5 h-5 rounded object-cover cursor-pointer"
                                      onClick={() => openLightbox(item.FotoSampah.map(f => f.urlFoto), item.FotoSampah.findIndex(f => f.id === foto.id))}
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
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
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
                            <StatusIconComp className="w-3 h-3" />
                            {status.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Calendar className="w-3 h-3" />
                            {formatDate(item.createdAt)}
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
                              onClick={() => handleEdit(item)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                              title="Edit Laporan"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(item.id)}
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

        {/* Empty state illustration for no filter results */}
        {sortedLaporan.length === 0 && laporan.length > 0 && (
          <p className="text-center text-gray-500 mt-4">
            Tidak ada laporan yang cocok dengan filter.
          </p>
        )}
      </div>

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
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium mt-1 ${statusConfig[selectedLaporan.status].bg} ${statusConfig[selectedLaporan.status].text}`}>
                    <StatusIcon status={selectedLaporan.status} />
                    {statusConfig[selectedLaporan.status].label}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500">Jenis Sampah</p>
                  <p className="font-medium">{selectedLaporan.jenisSampah.namaJenis}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Rp {selectedLaporan.jenisSampah.hargaPerKg.toLocaleString()}/kg
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500">Berat</p>
                  <p className="font-medium">{selectedLaporan.berat} kg</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500">Wilayah</p>
                  <p className="font-medium flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-gray-400" />
                    {selectedLaporan.wilayah.namaWilayah}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500">Tanggal Lapor</p>
                  <p className="font-medium">{formatDate(selectedLaporan.createdAt)}</p>
                </div>
              </div>

              {selectedLaporan.deskripsi && (
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500">Deskripsi</p>
                  <p className="mt-1 text-gray-700">{selectedLaporan.deskripsi}</p>
                </div>
              )}

              {selectedLaporan.FotoSampah && selectedLaporan.FotoSampah.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-2">Foto Sampah</p>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedLaporan.FotoSampah.map((foto, idx) => (
                      <div
                        key={foto.id}
                        className="relative cursor-pointer"
                        onClick={() => openLightbox(selectedLaporan.FotoSampah.map(f => f.urlFoto), idx)}
                      >
                        <img
                          src={foto.urlFoto}
                          alt="Foto sampah"
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 bg-black/30 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition">
                          <Maximize2 className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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

      {/* Edit Modal */}
      {isEditModalOpen && editingLaporan && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Edit Laporan</h2>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingLaporan(null);
                  setRemovedPhotoIds([]);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jenis Sampah <span className="text-red-500">*</span>
                </label>
                <select
                  value={editFormData.jenisSampahId}
                  onChange={(e) => setEditFormData({ ...editFormData, jenisSampahId: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition bg-gray-50/50 hover:bg-white"
                >
                  {jenisSampahList.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.namaJenis}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Wilayah <span className="text-red-500">*</span>
                </label>
                <select
                  value={editFormData.wilayahId}
                  onChange={(e) => setEditFormData({ ...editFormData, wilayahId: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition bg-gray-50/50 hover:bg-white"
                >
                  {wilayahList.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.namaWilayah}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Berat (kg) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  required
                  value={editFormData.berat}
                  onChange={(e) => setEditFormData({ ...editFormData, berat: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition bg-gray-50/50 hover:bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deskripsi <span className="text-xs text-gray-400 font-normal">(opsional)</span>
                </label>
                <textarea
                  rows={3}
                  value={editFormData.deskripsi}
                  onChange={(e) => setEditFormData({ ...editFormData, deskripsi: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition bg-gray-50/50 hover:bg-white resize-none"
                />
              </div>

              {/* Foto Sampah */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Foto Sampah
                </label>

                {/* Existing photos */}
                {editPhotos.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {editPhotos.map((foto) => (
                      <div key={foto.id} className="relative group">
                        <img
                          src={foto.urlFoto}
                          alt="Foto sampah"
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeEditPhoto(foto.id)}
                          className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                          title="Hapus foto"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* New photo previews */}
                {editNewPreviews.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {editNewPreviews.map((src, idx) => (
                      <div key={idx} className="relative group">
                        <img
                          src={src}
                          alt={`Preview ${idx + 1}`}
                          className="w-full h-24 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            URL.revokeObjectURL(editNewPreviews[idx]);
                            setEditNewPhotos(prev => prev.filter((_, i) => i !== idx));
                            setEditNewPreviews(prev => prev.filter((_, i) => i !== idx));
                          }}
                          className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                          title="Hapus foto"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <input
                  ref={editPhotoInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  multiple
                  onChange={handleEditPhotoSelect}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => editPhotoInputRef.current?.click()}
                  className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition flex items-center gap-2 text-sm"
                >
                  <Upload className="w-4 h-4" />
                  Tambah Foto
                </button>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingLaporan(null);
                    setRemovedPhotoIds([]);
                  }}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition disabled:opacity-70"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                      Menyimpan...
                    </>
                  ) : (
                    'Simpan'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Hapus Laporan</h3>
              <p className="text-gray-600">
                Apakah Anda yakin ingin menghapus laporan ini?
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
                    setDeletingId(null);
                  }}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition"
                >
                  Batal
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deleting}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition disabled:opacity-70"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                      Menghapus...
                    </>
                  ) : (
                    'Hapus'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Photo Lightbox */}
      {lightboxOpen && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 p-2 text-white hover:bg-white/20 rounded-lg transition"
          >
            <X className="w-6 h-6" />
          </button>

          {lightboxPhotos.length > 1 && (
            <>
              <button
                onClick={prevPhoto}
                className="absolute left-4 p-2 text-white hover:bg-white/20 rounded-lg transition"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button
                onClick={nextPhoto}
                className="absolute right-4 p-2 text-white hover:bg-white/20 rounded-lg transition"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </>
          )}

          <div className="max-w-4xl max-h-[80vh] flex items-center justify-center">
            <img
              src={lightboxPhotos[lightboxIndex]}
              alt="Foto sampah"
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />
          </div>

          {lightboxPhotos.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm">
              {lightboxIndex + 1} / {lightboxPhotos.length}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
