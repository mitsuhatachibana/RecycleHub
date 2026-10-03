'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Edit2,
  Save,
  X,
  Upload,
} from 'lucide-react';
import { Toast } from '@/app/components/UI/Toast';
import { Breadcrumb } from '@/app/components/UI/Breadcrumb';
import { NO_HP_MAX_LENGTH } from '@/app/lib/phone';

interface UserProfile {
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

export default function UserProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nama: '',
    noHp: '',
    alamat: '',
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let ignore = false;

    const loadUser = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (ignore) return;

        if (!res.ok) {
          router.push('/login');
          return;
        }

        const data = await res.json();
        if (ignore) return;

        setUser(data);
        setFormData({
          nama: data.nama || '',
          noHp: data.noHp || '',
          alamat: data.alamat || '',
        });
      } catch {
        if (!ignore) router.push('/login');
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    void loadUser();

    return () => {
      ignore = true;
    };
  }, [router]);

  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      setError('Format file tidak didukung. Gunakan JPG, PNG, WEBP, atau GIF');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('Ukuran file terlalu besar. Maksimal 2MB');
      return;
    }

    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const uploadPhoto = async (): Promise<string | null> => {
    if (!photoFile) return null;

    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('file', photoFile);

      const res = await fetch('/api/auth/upload-foto', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal upload foto');

      setUser(data);
      setPhotoFile(null);
      setPhotoPreview(null);
      return data.fotoProfil;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal upload foto');
      return null;
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Gagal menyimpan');
      }

      setUser(data);
      setIsEditing(false);
      setSuccess('Profil berhasil diperbarui');
      setTimeout(() => setSuccess(''), 3000);

      if (photoFile) {
        await uploadPhoto();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        nama: user.nama || '',
        noHp: user.noHp || '',
        alamat: user.alamat || '',
      });
    }
    setIsEditing(false);
    setError('');
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-green-600 mx-auto mb-3" />
          <p className="text-gray-600">Memuat profil...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <p className="text-gray-600">Gagal memuat profil</p>
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

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumb items={[
          { label: 'Profil Saya', href: '/dashboard/user/profile' }
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
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Profil Saya</h1>
              <p className="text-sm text-gray-500 mt-1">
                Kelola informasi profil Anda
              </p>
            </div>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition flex items-center gap-2 shadow-lg shadow-green-500/25"
            >
              <Edit2 className="w-4 h-4" />
              <span>Edit</span>
            </button>
          )}
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-linear-to-r from-green-600 to-emerald-600 p-6 text-white">
            <div className="flex items-center gap-4">
              {user.fotoProfil ? (
                <Image
                  src={user.fotoProfil}
                  alt={user.nama}
                  width={80}
                  height={80}
                  className="w-20 h-20 rounded-full border-4 border-white/30 object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold border-4 border-white/30">
                  {user.nama.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold">{user.nama}</h2>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/20 mt-1">
                  {user.role === 'ADMIN' ? '👑 Admin' : '👤 User'}
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8">
            {isEditing ? (
              <form onSubmit={handleSave} className="space-y-6">
                {/* Foto Profil */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Foto Profil
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
                      {photoPreview || user.fotoProfil ? (
                        <Image
                          src={photoPreview || user.fotoProfil || ''}
                          alt="Preview"
                          width={64}
                          height={64}
                          unoptimized
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xl font-bold text-gray-400">
                          {user.nama.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <input
                        ref={photoInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={handlePhotoSelect}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => photoInputRef.current?.click()}
                        disabled={uploadingPhoto}
                        className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition flex items-center gap-2 text-sm disabled:opacity-50"
                      >
                        <Upload className="w-4 h-4" />
                        {uploadingPhoto ? 'Mengupload...' : 'Pilih Foto'}
                      </button>
                      {photoFile && (
                        <p className="text-xs text-gray-500 mt-1">{photoFile.name}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      required
                      maxLength={100}
                      value={formData.nama}
                      onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                      className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition bg-gray-50/50 hover:bg-white"
                    />
                    <p className="mt-1 text-xs text-gray-400 text-right">{formData.nama.length}/100</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    No. HP
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      inputMode="tel"
                      required
                      maxLength={NO_HP_MAX_LENGTH}
                      value={formData.noHp}
                      onChange={(e) =>
                        setFormData({ ...formData, noHp: e.target.value.slice(0, NO_HP_MAX_LENGTH) })
                      }
                      placeholder="0812xxxxxxx atau +62812xxxxxxx"
                      className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition bg-gray-50/50 hover:bg-white"
                    />
                    <p className="mt-1 text-xs text-gray-400 text-right">{formData.noHp.length}/{NO_HP_MAX_LENGTH}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alamat
                  </label>
                  <div className="relative">
                    <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <textarea
                      rows={3}
                      value={formData.alamat}
                      onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                      className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition bg-gray-50/50 hover:bg-white resize-none"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition flex items-center justify-center gap-2 shadow-lg shadow-green-500/25 disabled:opacity-70"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Simpan
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Nama Lengkap</p>
                  <div className="flex items-center gap-2 text-gray-900">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{user.nama}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Email</p>
                  <div className="flex items-center gap-2 text-gray-900">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{user.email}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">NIK</p>
                  <div className="flex items-center gap-2 text-gray-900">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{user.nik}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">No. HP</p>
                  <div className="flex items-center gap-2 text-gray-900">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{user.noHp}</span>
                  </div>
                </div>

                <div className="space-y-1 md:col-span-2">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Alamat</p>
                  <div className="flex items-center gap-2 text-gray-900">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{user.alamat || '-'}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Tanggal Bergabung</p>
                  <div className="flex items-center gap-2 text-gray-900">
                    <CheckCircle2 className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{formatDate(user.createdAt)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
