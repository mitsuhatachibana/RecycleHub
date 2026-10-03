'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Eye,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
  RefreshCw,
  Clock,
  Package,
  XCircle,
  Coins,
} from 'lucide-react';
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
    poin: number;
  };
  user: {
    id: string;
    nama: string;
    email: string;
  };
  tipePembayaran?: string;
  metodePembayaran?: string;
  statusPembayaran?: string;
  tanggalJatuhTempo?: string;
  buktiPembayaran?: string;
  catatan?: string;
}

const statusConfig = {
  PENDING: { label: 'Menunggu', bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
  DIPROSES: { label: 'Diproses', bg: 'bg-blue-100', text: 'text-blue-800', icon: Package },
  SELESAI: { label: 'Selesai', bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle2 },
  BATAL: { label: 'Batal', bg: 'bg-red-100', text: 'text-red-800', icon: XCircle },
};

export default function AdminRedeemPage() {
  const [redeems, setRedeems] = useState<Redeem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedRedeem, setSelectedRedeem] = useState<Redeem | null>(null);
  const [paymentForm, setPaymentForm] = useState({
    tipePembayaran: 'CASH',
    metodePembayaran: 'cash',
    statusPembayaran: 'LUNAS',
    tanggalJatuhTempo: '',
    buktiPembayaran: '',
    catatan: '',
  });

  const fetchRedeems = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        page: '1',
        limit: '20',
        ...(searchTerm && { search: searchTerm }),
        ...(filterStatus && { status: filterStatus }),
      });

      const res = await fetch(`/api/redeem?${params}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Gagal mengambil data');
      }
      const data = await res.json();
      setRedeems(data.data || []);
    } catch (error) {
      console.error('Error fetching redeems:', error);
      setError(error instanceof Error ? error.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filterStatus]);

  useEffect(() => {
    void fetchRedeems();
  }, [fetchRedeems]);

  const handleStatusUpdate = async (id: string, status: string) => {
    const redeem = redeems.find(r => r.id === id);
    if (!redeem) return;

    if (status === 'SELESAI' || status === 'DIPROSES') {
      setSelectedRedeem(redeem);
      setPaymentForm({
        tipePembayaran: redeem.tipePembayaran === 'KREDIT' ? 'KREDIT' : 'CASH',
        metodePembayaran: redeem.metodePembayaran || 'cash',
        statusPembayaran: redeem.statusPembayaran === 'JATUH_TEMPO' ? 'JATUH_TEMPO' : 'LUNAS',
        tanggalJatuhTempo: redeem.tanggalJatuhTempo ? new Date(redeem.tanggalJatuhTempo).toISOString().split('T')[0] : '',
        buktiPembayaran: redeem.buktiPembayaran || '',
        catatan: redeem.catatan || '',
      });
      setIsPaymentModalOpen(true);
      return;
    }

    setUpdatingId(id);
    try {
      const res = await fetch(`/api/redeem/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Gagal update status');
      }

      setSuccess(`Status penukaran berhasil diupdate menjadi ${statusConfig[status as keyof typeof statusConfig].label}`);
      fetchRedeems();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Terjadi kesalahan');
    } finally {
      setUpdatingId(null);
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRedeem) return;

    setUpdatingId(selectedRedeem.id);
    try {
      const dueDate = paymentForm.tipePembayaran === 'KREDIT' && paymentForm.tanggalJatuhTempo
        ? new Date(paymentForm.tanggalJatuhTempo).toISOString()
        : null;

      const res = await fetch(`/api/redeem/${selectedRedeem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'DIPROSES',
          tipePembayaran: paymentForm.tipePembayaran,
          metodePembayaran: paymentForm.metodePembayaran,
          statusPembayaran: paymentForm.statusPembayaran,
          tanggalJatuhTempo: dueDate,
          buktiPembayaran: paymentForm.buktiPembayaran || null,
          catatan: paymentForm.catatan || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Gagal menyimpan pembayaran');
      }

      setSuccess('Pembayaran berhasil disimpan');
      setIsPaymentModalOpen(false);
      setSelectedRedeem(null);
      fetchRedeems();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Terjadi kesalahan');
    } finally {
      setUpdatingId(null);
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

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <Breadcrumb items={[
        { label: 'Penukaran', href: '/dashboard/admin/redeem' }
      ]} />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Manajemen Penukaran</h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola seluruh penukaran poin user
          </p>
        </div>
        <button
          onClick={fetchRedeems}
          className="px-5 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
        <LogoutButton variant="icon" />
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

      {/* Filter & Search */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari penukaran (user, reward)..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition bg-gray-50/50 hover:bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50/50 hover:bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">Semua Status</option>
            {Object.entries(statusConfig).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reward
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Poin
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
                  <td colSpan={6} className="text-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-green-500 mx-auto" />
                    <p className="text-gray-500 mt-2">Memuat data...</p>
                  </td>
                </tr>
              ) : redeems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <div className="text-6xl mb-4">📦</div>
                    <p className="text-gray-500">Tidak ada penukaran ditemukan</p>
                  </td>
                </tr>
              ) : (
                redeems.map((item) => {
                  const status = statusConfig[item.status];
                  const StatusIcon = status.icon;

                  return (
                    <tr key={item.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                            {item.reward.gambar ? (
                              <img src={item.reward.gambar} alt={item.reward.nama} className="w-10 h-10 rounded-lg object-cover" />
                            ) : (
                              <Package className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                          <span className="text-sm font-medium text-gray-900">{item.reward.nama}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm text-gray-900">{item.user.nama}</p>
                          <p className="text-xs text-gray-500">{item.user.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-green-600">
                          <Coins className="w-4 h-4" />
                          <span className="font-medium">{item.poinDigunakan}</span>
                        </div>
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
                            onClick={() => window.open(`/dashboard/admin/redeem/${item.id}/receipt`, '_blank')}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                            title="Lihat Struk"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {item.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleStatusUpdate(item.id, 'DIPROSES')}
                                disabled={updatingId === item.id}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition disabled:opacity-50"
                                title="Proses"
                              >
                                {updatingId === item.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Package className="w-4 h-4" />
                                )}
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(item.id, 'SELESAI')}
                                disabled={updatingId === item.id}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition disabled:opacity-50"
                                title="Selesai"
                              >
                                {updatingId === item.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <CheckCircle2 className="w-4 h-4" />
                                )}
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(item.id, 'BATAL')}
                                disabled={updatingId === item.id}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                                title="Batalkan"
                              >
                                {updatingId === item.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <XCircle className="w-4 h-4" />
                                )}
                              </button>
                            </>
                          )}
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

      {/* Payment Modal */}
      {isPaymentModalOpen && selectedRedeem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Detail Pembayaran</h2>
              <button
                onClick={() => {
                  setIsPaymentModalOpen(false);
                  setSelectedRedeem(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePaymentSubmit} className="p-6 space-y-4">
              {/* Order Info */}
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <p className="text-sm text-gray-600">Reward: <span className="font-medium text-gray-900">{selectedRedeem.reward.nama}</span></p>
                <p className="text-sm text-gray-600">User: <span className="font-medium text-gray-900">{selectedRedeem.user.nama}</span></p>
                <p className="text-sm text-gray-600">Poin: <span className="font-medium text-green-600">{selectedRedeem.poinDigunakan} poin</span></p>
              </div>

              {/* Payment Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipe Pembayaran <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentForm({ ...paymentForm, tipePembayaran: 'CASH', metodePembayaran: 'cash', statusPembayaran: 'LUNAS', tanggalJatuhTempo: '' })}
                    className={`px-4 py-3 rounded-xl border-2 transition ${
                      paymentForm.tipePembayaran === 'CASH'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-lg mb-1">💵</div>
                    <div className="font-medium">Cash</div>
                    <div className="text-xs text-gray-500">Bayar sekarang</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentForm({ ...paymentForm, tipePembayaran: 'KREDIT', statusPembayaran: 'JATUH_TEMPO' })}
                    className={`px-4 py-3 rounded-xl border-2 transition ${
                      paymentForm.tipePembayaran === 'KREDIT'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-lg mb-1">💳</div>
                    <div className="font-medium">Kredit</div>
                    <div className="text-xs text-gray-500">Bayar nanti</div>
                  </button>
                </div>
              </div>

              {/* Payment Method */}
              {paymentForm.tipePembayaran === 'CASH' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Metode Pembayaran <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={paymentForm.metodePembayaran}
                    onChange={(e) => setPaymentForm({ ...paymentForm, metodePembayaran: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition bg-gray-50/50 hover:bg-white"
                  >
                    <option value="cash">Cash</option>
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Metode Pembayaran <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={paymentForm.metodePembayaran}
                    onChange={(e) => setPaymentForm({ ...paymentForm, metodePembayaran: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition bg-gray-50/50 hover:bg-white"
                  >
                    <option value="ovo">OVO</option>
                    <option value="gopay">GoPay</option>
                    <option value="dana">Dana</option>
                    <option value="shopeepay">ShopeePay</option>
                    <option value="bca">BCA</option>
                    <option value="bni">BNI</option>
                    <option value="bri">BRI</option>
                    <option value="mandiri">Mandiri</option>
                  </select>
                </div>
              )}

              {/* Payment Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status Pembayaran <span className="text-red-500">*</span>
                </label>
                <select
                  value={paymentForm.statusPembayaran}
                  onChange={(e) => setPaymentForm({ ...paymentForm, statusPembayaran: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition bg-gray-50/50 hover:bg-white"
                >
                  <option value="LUNAS">Lunas</option>
                  <option value="JATUH_TEMPO">Jatuh Tempo</option>
                  <option value="BELUM_BAYAR">Belum Bayar</option>
                </select>
              </div>

              {/* Due Date (for credit) */}
              {paymentForm.tipePembayaran === 'KREDIT' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tanggal Jatuh Tempo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={paymentForm.tanggalJatuhTempo}
                    onChange={(e) => setPaymentForm({ ...paymentForm, tanggalJatuhTempo: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    max={new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition bg-gray-50/50 hover:bg-white"
                  />
                  <p className="text-xs text-gray-500 mt-1">Maksimal 2 bulan dari sekarang</p>
                </div>
              )}

              {/* Payment Proof */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bukti Pembayaran (URL)
                </label>
                <input
                  type="text"
                  value={paymentForm.buktiPembayaran}
                  onChange={(e) => setPaymentForm({ ...paymentForm, buktiPembayaran: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition bg-gray-50/50 hover:bg-white"
                  placeholder="https://..."
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catatan
                </label>
                <textarea
                  rows={3}
                  value={paymentForm.catatan}
                  onChange={(e) => setPaymentForm({ ...paymentForm, catatan: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition bg-gray-50/50 hover:bg-white resize-none"
                  placeholder="Catatan tambahan..."
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsPaymentModalOpen(false);
                    setSelectedRedeem(null);
                  }}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={updatingId === selectedRedeem.id}
                  className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition disabled:opacity-70"
                >
                  {updatingId === selectedRedeem.id ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                      Menyimpan...
                    </>
                  ) : (
                    'Simpan Pembayaran'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
