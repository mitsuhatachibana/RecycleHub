'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Trash2,
  MapPin,
  Package,
  Weight,
  FileText,
  ArrowLeft,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Upload,
  X,
} from 'lucide-react';
import { Toast } from '@/app/components/UI/Toast';
import { LogoutButton } from '@/app/components/UI/LogoutButton';
import { Breadcrumb } from '@/app/components/UI/Breadcrumb';

interface JenisSampah {
  id: string;
  namaJenis: string;
  hargaPerKg: number;
  deskripsi: string | null;
}

interface Wilayah {
  id: string;
  namaWilayah: string;
}

interface User {
  id: string;
  nama: string;
  email: string;
  role: string;
}

export default function LaporanBaruPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [jenisSampah, setJenisSampah] = useState<JenisSampah[]>([]);
  const [wilayah, setWilayah] = useState<Wilayah[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    jenisSampahId: '',
    wilayahId: '',
    berat: '',
    deskripsi: '',
  });

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
      }
    };
    void checkSession();
  }, [router]);

  useEffect(() => {
    if (!user) return;

    let mounted = true;
    const fetchData = async () => {
      setLoadingData(true);
      try {
        const [jenisRes, wilayahRes] = await Promise.all([
          fetch('/api/jenis-sampah'),
          fetch('/api/wilayah?limit=100'),
        ]);

        if (jenisRes.ok) {
          const jenisData = await jenisRes.json();
          if (mounted) setJenisSampah(jenisData);
        }

        if (wilayahRes.ok) {
          const wilayahData = await wilayahRes.json();
          if (mounted) setWilayah(wilayahData.data || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        if (mounted) setLoadingData(false);
      }
    };
    void fetchData();

    return () => { mounted = false; };
  }, [user]);

  useEffect(() => {
    if (user) {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    return () => {
      previews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previews]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(f => {
      if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(f.type)) {
        setToast({ message: `File "${f.name}" bukan format gambar yang didukung`, type: 'error' });
        return false;
      }
      if (f.size > 5 * 1024 * 1024) {
        setToast({ message: `File "${f.name}" terlalu besar (maks 5MB)`, type: 'error' });
        return false;
      }
      return true;
    });

    const newPreviews = validFiles.map(f => URL.createObjectURL(f));
    setSelectedFiles(prev => [...prev, ...validFiles]);
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeFile = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.jenisSampahId || !formData.wilayahId || !formData.berat) {
      setToast({ message: 'Jenis sampah, wilayah, dan berat harus diisi', type: 'error' });
      return;
    }

    const beratNum = parseFloat(formData.berat);
    if (isNaN(beratNum) || beratNum <= 0) {
      setToast({ message: 'Berat harus berupa angka yang valid', type: 'error' });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/laporan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jenisSampahId: formData.jenisSampahId,
          wilayahId: formData.wilayahId,
          berat: beratNum,
          deskripsi: formData.deskripsi,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Gagal membuat laporan');
      }

      await uploadPhotos(data.id);
    } catch (err) {
      setToast({
        message: err instanceof Error ? err.message : 'Terjadi kesalahan',
        type: 'error',
      });
      setSubmitting(false);
    }
  };

  const uploadPhotos = async (laporanId: string) => {
    if (selectedFiles.length === 0) {
      setToast({ message: 'Laporan berhasil dibuat!', type: 'success' });
      setTimeout(() => {
        router.push('/dashboard/user/laporan');
      }, 1500);
      return;
    }

    setUploading(true);
    try {
      for (const file of selectedFiles) {
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
      }

      setToast({ message: 'Laporan dan foto berhasil disimpan!', type: 'success' });
      setTimeout(() => {
        router.push('/dashboard/user/laporan');
      }, 1500);
    } catch (err) {
      setToast({
        message: err instanceof Error ? err.message : 'Gagal upload foto',
        type: 'error',
      });
    } finally {
      setUploading(false);
      setSubmitting(false);
    }
  };

  const selectedJenis = jenisSampah.find((j) => j.id === formData.jenisSampahId);
  const estimatedPrice = selectedJenis && formData.berat
    ? selectedJenis.hargaPerKg * parseFloat(formData.berat)
    : 0;

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-green-50 via-emerald-50 to-teal-50">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-green-600 mx-auto mb-3" />
          <p className="text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 md:py-8">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumb items={[
          { label: 'Laporan Saya', href: '/dashboard/user/laporan' },
          { label: 'Buat Laporan Baru' }
        ]} />

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard/user/laporan')}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Buat Laporan Baru</h1>
              <p className="text-sm text-gray-500 mt-1">
                Laporkan sampah daur ulang Anda
              </p>
            </div>
          </div>
          <LogoutButton variant="icon" />
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Jenis Sampah */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jenis Sampah <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.jenisSampahId}
                  onChange={(e) => setFormData({ ...formData, jenisSampahId: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition bg-gray-50/50 hover:bg-white"
                >
                  <option value="">Pilih jenis sampah</option>
                  {jenisSampah.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.namaJenis} — Rp {j.hargaPerKg.toLocaleString()}/kg
                    </option>
                  ))}
                </select>
                {selectedJenis?.deskripsi && (
                  <p className="text-xs text-gray-500 mt-1.5 italic">
                    {selectedJenis.deskripsi}
                  </p>
                )}
              </div>

              {/* Wilayah */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Wilayah <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.wilayahId}
                  onChange={(e) => setFormData({ ...formData, wilayahId: e.target.value })}
                  required
                  disabled={wilayah.length === 0}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition bg-gray-50/50 hover:bg-white disabled:opacity-50"
                >
                  <option value="">Pilih wilayah</option>
                  {wilayah.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.namaWilayah}
                    </option>
                  ))}
                </select>
              </div>

              {/* Berat */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Berat (kg) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Weight className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    placeholder="Contoh: 2.5"
                    value={formData.berat}
                    onChange={(e) => setFormData({ ...formData, berat: e.target.value })}
                    required
                    className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition bg-gray-50/50 hover:bg-white"
                  />
                </div>
              </div>

              {/* Estimasi Harga */}
              {selectedJenis && formData.berat && estimatedPrice > 0 && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      Estimasi harga: Rp {Math.round(estimatedPrice).toLocaleString()}
                    </span>
                  </div>
                  <span className="text-xs text-green-600">
                    {selectedJenis.namaJenis} × {formData.berat} kg × Rp {selectedJenis.hargaPerKg.toLocaleString()}
                  </span>
                </div>
              )}

              {/* Deskripsi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deskripsi <span className="text-xs text-gray-400 font-normal">(opsional)</span>
                </label>
                <div className="relative">
                  <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                    <FileText className="h-5 w-5 text-gray-400" />
                  </div>
                  <textarea
                    rows={4}
                    placeholder="Deskripsikan sampah yang akan dilaporkan..."
                    value={formData.deskripsi}
                    onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                    className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition bg-gray-50/50 hover:bg-white resize-none"
                  />
                </div>
              </div>

              {/* Foto Sampah */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Foto Sampah <span className="text-xs text-gray-400 font-normal">(opsional)</span>
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-green-500 hover:bg-green-50/50 transition"
                >
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Klik untuk upload foto sampah</p>
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP, GIF (maks 5MB)</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>

                {/* Preview */}
                {previews.length > 0 && (
                  <div className="grid grid-cols-3 gap-3 mt-3">
                    {previews.map((src, idx) => (
                      <div key={idx} className="relative group">
                        <img
                          src={src}
                          alt={`Preview ${idx + 1}`}
                          className="w-full h-24 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeFile(idx)}
                          className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </form>
          </div>

          {/* Footer Actions */}
          <div className="bg-gray-50 border-t border-gray-100 px-6 md:px-8 py-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => router.push('/dashboard/user/laporan')}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Batal</span>
            </button>

            <button
              onClick={handleSubmit}
              disabled={submitting || uploading || !formData.jenisSampahId || !formData.wilayahId || !formData.berat}
              className="px-6 py-3 bg-linear-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition flex items-center gap-2 shadow-lg shadow-green-500/25 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {submitting || uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{uploading ? 'Mengupload foto...' : 'Menyimpan...'}</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Simpan Laporan</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
