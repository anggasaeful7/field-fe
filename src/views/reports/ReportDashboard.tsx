import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import {
  Plus,
  Edit2,
  CheckCircle2,
  XCircle,
  Search,
  RefreshCw,
  FileText,
  Check,
  X,
  Clock,
  Eye,
  History,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';

interface ReportLog {
  id: number;
  action: 'created' | 'updated' | 'approved' | 'rejected' | string;
  notes: string | null;
  created_at: string;
  actor_name: string;
  actor_role: string;
}

interface Report {
  id: number;
  nama: string;
  deskripsi: string;
  status: 'pending' | 'approved' | 'rejected';
  reporter_id: number;
  reporter_name: string;
  reviewed_by: number | null;
  reviewer_name: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

interface ReportDetail extends Report {
  reporter_email?: string;
  logs?: ReportLog[];
}

const ReportDashboard = () => {
  const { user, isAdmin, isApprover, isPelapor } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  const [createOpen, setCreateOpen] = useState(false);
  const [createNama, setCreateNama] = useState('');
  const [createDeskripsi, setCreateDeskripsi] = useState('');
  const [submittingCreate, setSubmittingCreate] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [editNama, setEditNama] = useState('');
  const [editDeskripsi, setEditDeskripsi] = useState('');
  const [submittingEdit, setSubmittingEdit] = useState(false);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailReport, setDetailReport] = useState<ReportDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await apiFetch<Report[]>('/api/reports');
      if (res.success && res.data) {
        setReports(res.data);
      }
    } catch (err: any) {
      toast.error(err.message || 'Gagal memuat laporan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createNama.trim() || !createDeskripsi.trim()) {
      toast.error('Nama dan deskripsi laporan wajib diisi');
      return;
    }

    setSubmittingCreate(true);
    try {
      const res = await apiFetch<Report>('/api/reports', {
        method: 'POST',
        body: JSON.stringify({ nama: createNama, deskripsi: createDeskripsi }),
      });

      if (res.success && res.data) {
        toast.success('Laporan berhasil dibuat');
        setCreateNama('');
        setCreateDeskripsi('');
        setCreateOpen(false);
        fetchReports();
      }
    } catch (err: any) {
      toast.error(err.message || 'Gagal membuat laporan');
    } finally {
      setSubmittingCreate(false);
    }
  };

  const openEditModal = (report: Report) => {
    if (report.status !== 'pending') {
      toast.error('Hanya laporan berstatus pending yang dapat diedit');
      return;
    }
    setEditId(report.id);
    setEditNama(report.nama);
    setEditDeskripsi(report.deskripsi);
    setEditOpen(true);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId || !editNama.trim() || !editDeskripsi.trim()) {
      toast.error('Nama dan deskripsi laporan wajib diisi');
      return;
    }

    setSubmittingEdit(true);
    try {
      const res = await apiFetch<Report>(`/api/reports/${editId}`, {
        method: 'PUT',
        body: JSON.stringify({ nama: editNama, deskripsi: editDeskripsi }),
      });

      if (res.success) {
        toast.success('Laporan berhasil diperbarui');
        setEditOpen(false);
        fetchReports();
      }
    } catch (err: any) {
      toast.error(err.message || 'Gagal memperbarui laporan');
    } finally {
      setSubmittingEdit(false);
    }
  };

  const openDetailModal = async (id: number) => {
    setDetailOpen(true);
    setLoadingDetail(true);
    try {
      const res = await apiFetch<ReportDetail>(`/api/reports/${id}`);
      if (res.success && res.data) {
        setDetailReport(res.data);
      }
    } catch (err: any) {
      toast.error(err.message || 'Gagal memuat detail laporan');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleStatusChange = async (id: number, status: 'approved' | 'rejected') => {
    setActionLoadingId(id);
    try {
      const res = await apiFetch<Report>(`/api/reports/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });

      if (res.success && res.data) {
        toast.success(`Laporan #${id} diubah menjadi ${status}`);
        setReports((prev) => prev.map((r) => (r.id === id ? { ...r, ...res.data! } : r)));
        if (detailOpen && detailReport?.id === id) {
          openDetailModal(id);
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Gagal mengubah status');
    } finally {
      setActionLoadingId(null);
    }
  };

  const stats = useMemo(() => {
    return {
      total: reports.length,
      pending: reports.filter((r) => r.status === 'pending').length,
      approved: reports.filter((r) => r.status === 'approved').length,
      rejected: reports.filter((r) => r.status === 'rejected').length,
    };
  }, [reports]);

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const matchSearch =
        r.nama.toLowerCase().includes(search.toLowerCase()) ||
        r.deskripsi.toLowerCase().includes(search.toLowerCase()) ||
        r.reporter_name.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || r.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [reports, search, statusFilter]);

  const renderStatusBadge = (status: Report['status']) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800 gap-1">
            <Clock className="size-3" />
            Pending
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 gap-1">
            <CheckCircle2 className="size-3" />
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800 gap-1">
            <XCircle className="size-3" />
            Rejected
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Main Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Laporan Lapangan</h1>
            <Badge variant="secondary" className="capitalize text-xs font-medium">
              Role: {user?.role}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isPelapor
              ? 'Kelola dan pantau laporan lapangan yang Anda buat.'
              : 'Pantau, verifikasi, dan kelola keputusan persetujuan laporan lapangan.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchReports} disabled={loading} className="cursor-pointer">
            <RefreshCw className={`size-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Muat Ulang
          </Button>

          {(isPelapor || isAdmin) && (
            <Button size="sm" onClick={() => setCreateOpen(true)} className="cursor-pointer">
              <Plus className="size-4 mr-1.5" />
              Buat Laporan Baru
            </Button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl border bg-card shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Total Laporan</span>
            <FileText className="size-4 text-primary" />
          </div>
          <p className="text-2xl font-bold mt-2 text-foreground">{stats.total}</p>
        </div>
        <div className="p-4 rounded-xl border bg-card shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Pending</span>
            <Clock className="size-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold mt-2 text-amber-600 dark:text-amber-400">{stats.pending}</p>
        </div>
        <div className="p-4 rounded-xl border bg-card shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Approved</span>
            <CheckCircle2 className="size-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold mt-2 text-emerald-600 dark:text-emerald-400">{stats.approved}</p>
        </div>
        <div className="p-4 rounded-xl border bg-card shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Rejected</span>
            <XCircle className="size-4 text-rose-500" />
          </div>
          <p className="text-2xl font-bold mt-2 text-rose-600 dark:text-rose-400">{stats.rejected}</p>
        </div>
      </div>

      {/* Search & Status Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama, deskripsi, pelapor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 border rounded-lg bg-card/60 overflow-x-auto">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((filter) => (
            <Button
              key={filter}
              variant={statusFilter === filter ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setStatusFilter(filter)}
              className="h-7 px-3 text-xs capitalize cursor-pointer font-medium"
            >
              {filter === 'all' ? 'Semua' : filter}
            </Button>
          ))}
        </div>
      </div>

      {/* Reports Table */}
      <div className="border rounded-xl bg-card shadow-xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="w-14 text-center font-semibold">ID</TableHead>
              <TableHead className="font-semibold min-w-50">Laporan Lapangan</TableHead>
              <TableHead className="font-semibold w-36">Pelapor</TableHead>
              <TableHead className="font-semibold w-28 text-center">Status</TableHead>
              <TableHead className="font-semibold w-40">Jejak Keputusan</TableHead>
              <TableHead className="font-semibold w-36">Dibuat Pada</TableHead>
              <TableHead className="w-36 text-right font-semibold">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="size-4 animate-spin" />
                    <span>Memuat data laporan...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredReports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  Tidak ada laporan lapangan yang ditemukan.
                </TableCell>
              </TableRow>
            ) : (
              filteredReports.map((report) => (
                <TableRow key={report.id} className="hover:bg-muted/30">
                  <TableCell className="text-center font-mono text-xs text-muted-foreground">
                    #{report.id}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-foreground">{report.nama}</div>
                    <div className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{report.deskripsi}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium text-foreground">{report.reporter_name}</div>
                  </TableCell>
                  <TableCell className="text-center">{renderStatusBadge(report.status)}</TableCell>
                  <TableCell>
                    {report.reviewer_name ? (
                      <div className="text-xs">
                        <span className="font-medium text-foreground">{report.reviewer_name}</span>
                        <div className="text-[11px] text-muted-foreground">
                          {report.reviewed_at ? new Date(report.reviewed_at).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }) : '-'}
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">Belum diputuskan</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(report.created_at).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Tombol Detail Laporan */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDetailModal(report.id)}
                        className="h-7 px-2 text-xs cursor-pointer gap-1 text-foreground hover:bg-muted"
                      >
                        <Eye className="size-3 text-muted-foreground" />
                        Detail
                      </Button>

                      {/* Pelapor Edit Button: Enabled only when status is pending */}
                      {isPelapor && (
                        report.status === 'pending' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditModal(report)}
                            className="h-7 px-2 text-xs cursor-pointer gap-1"
                          >
                            <Edit2 className="size-3" />
                            Edit
                          </Button>
                        ) : (
                          <span className="text-[11px] text-muted-foreground italic pr-1">Terkunci</span>
                        )
                      )}

                      {/* Approver / Admin Actions: Approve & Reject (with toggle ability) */}
                      {(isApprover || isAdmin) && (
                        <>
                          <Button
                            variant={report.status === 'approved' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handleStatusChange(report.id, 'approved')}
                            disabled={actionLoadingId === report.id}
                            className={`h-7 px-2 text-xs cursor-pointer gap-1 ${
                              report.status === 'approved'
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                : 'border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                            }`}
                          >
                            <Check className="size-3" />
                            Approve
                          </Button>

                          <Button
                            variant={report.status === 'rejected' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handleStatusChange(report.id, 'rejected')}
                            disabled={actionLoadingId === report.id}
                            className={`h-7 px-2 text-xs cursor-pointer gap-1 ${
                              report.status === 'rejected'
                                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                                : 'border-rose-300 text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                            }`}
                          >
                            <X className="size-3" />
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal: Tambah Laporan Baru */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Buat Laporan Lapangan Baru</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Nama Laporan</label>
              <Input
                placeholder="Contoh: Survei Lokasi Proyek Tahap 2"
                value={createNama}
                onChange={(e) => setCreateNama(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Deskripsi Kegiatan</label>
              <Textarea
                placeholder="Tuliskan temuan, progress, atau kendala di lapangan..."
                rows={4}
                value={createDeskripsi}
                onChange={(e) => setCreateDeskripsi(e.target.value)}
                required
              />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)} disabled={submittingCreate}>
                Batal
              </Button>
              <Button type="submit" disabled={submittingCreate} className="cursor-pointer">
                {submittingCreate ? 'Menyimpan...' : 'Simpan Laporan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal: Edit Laporan */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Laporan Lapangan #{editId}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Nama Laporan</label>
              <Input
                value={editNama}
                onChange={(e) => setEditNama(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Deskripsi Kegiatan</label>
              <Textarea
                rows={4}
                value={editDeskripsi}
                onChange={(e) => setEditDeskripsi(e.target.value)}
                required
              />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)} disabled={submittingEdit}>
                Batal
              </Button>
              <Button type="submit" disabled={submittingEdit} className="cursor-pointer">
                {submittingEdit ? 'Menyimpan...' : 'Perbarui Laporan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal: Detail Laporan & Timeline Riwayat */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-xl max-h-[88vh] flex flex-col p-6">
          <DialogHeader className="pb-3 border-b shrink-0">
            <div className="flex items-center justify-between gap-3 pr-6">
              <div>
                <DialogTitle className="text-lg font-bold flex items-center gap-2">
                  <span>Detail Laporan #{detailReport?.id}</span>
                  {detailReport && renderStatusBadge(detailReport.status)}
                </DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {detailReport
                    ? `Dibuat pada ${new Date(detailReport.created_at).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}`
                    : 'Memuat data laporan...'}
                </p>
              </div>
            </div>
          </DialogHeader>

          {loadingDetail ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <RefreshCw className="size-6 animate-spin text-primary" />
              <span className="text-xs">Memuat detail & riwayat laporan...</span>
            </div>
          ) : !detailReport ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              Laporan tidak ditemukan.
            </div>
          ) : (
            <div className="overflow-y-auto space-y-4 py-3 pr-1">
              {/* Box Rincian Data */}
              <div className="rounded-lg border bg-muted/20 p-3.5 space-y-3">
                <div>
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Nama Laporan
                  </span>
                  <p className="text-sm font-semibold text-foreground mt-0.5">{detailReport.nama}</p>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Deskripsi Kegiatan
                  </span>
                  <p className="text-xs text-foreground/90 mt-0.5 whitespace-pre-wrap leading-relaxed">
                    {detailReport.deskripsi}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t text-xs">
                  <div>
                    <span className="text-[11px] text-muted-foreground">Pelapor:</span>
                    <p className="font-medium text-foreground">{detailReport.reporter_name}</p>
                    {detailReport.reporter_email && (
                      <p className="text-[11px] text-muted-foreground">{detailReport.reporter_email}</p>
                    )}
                  </div>
                  <div>
                    <span className="text-[11px] text-muted-foreground">Status / Peninjau:</span>
                    <p className="font-medium text-foreground">
                      {detailReport.reviewer_name ? detailReport.reviewer_name : 'Belum Ditinjau'}
                    </p>
                    {detailReport.reviewed_at && (
                      <p className="text-[11px] text-muted-foreground">
                        {new Date(detailReport.reviewed_at).toLocaleString('id-ID', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Timeline Riwayat Aktivitas */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <History className="size-3.5 text-primary" />
                    <span>Timeline Riwayat Aktivitas</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    {detailReport.logs?.length || 0} catatan riwayat
                  </span>
                </div>

                {!detailReport.logs || detailReport.logs.length === 0 ? (
                  <div className="p-4 border rounded-lg text-center text-xs text-muted-foreground">
                    Belum ada riwayat aktivitas tercatat.
                  </div>
                ) : (
                  <div className="relative pl-6 space-y-3 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                    {detailReport.logs.map((log) => (
                      <div key={log.id} className="relative flex items-start gap-3">
                        <span
                          className={`absolute -left-6 top-1 size-5 rounded-full flex items-center justify-center text-white ring-4 ring-background shadow-xs ${
                            log.action === 'created'
                              ? 'bg-blue-600'
                              : log.action === 'updated'
                              ? 'bg-amber-600'
                              : log.action === 'approved'
                              ? 'bg-emerald-600'
                              : 'bg-rose-600'
                          }`}
                        >
                          {log.action === 'created' && <Plus className="size-3" />}
                          {log.action === 'updated' && <Edit2 className="size-3" />}
                          {log.action === 'approved' && <Check className="size-3" />}
                          {log.action === 'rejected' && <X className="size-3" />}
                        </span>

                        <div className="flex-1 rounded-lg border bg-card p-3 shadow-2xs text-xs space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-foreground">
                              {log.action === 'created'
                                ? 'Laporan Dibuat'
                                : log.action === 'updated'
                                ? 'Laporan Diperbarui'
                                : log.action === 'approved'
                                ? 'Laporan Disetujui'
                                : 'Laporan Ditolak'}
                            </span>
                            <span className="text-[11px] font-mono text-muted-foreground">
                              {new Date(log.created_at).toLocaleString('id-ID', {
                                dateStyle: 'medium',
                                timeStyle: 'medium',
                              })}
                            </span>
                          </div>

                          <p className="text-muted-foreground text-[11px] leading-relaxed">
                            {log.notes || '-'}
                          </p>

                          <div className="pt-1.5 mt-1.5 border-t flex items-center justify-between text-[11px] text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <User className="size-3 text-muted-foreground" />
                              <span>
                                Oleh: <strong className="text-foreground">{log.actor_name}</strong>
                              </span>
                            </div>
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 capitalize">
                              {log.actor_role}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="pt-3 border-t shrink-0 flex items-center justify-between sm:justify-between w-full">
            <div className="flex items-center gap-1.5">
              {(isApprover || isAdmin) && detailReport && (
                <>
                  <Button
                    variant={detailReport.status === 'approved' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleStatusChange(detailReport.id, 'approved')}
                    disabled={actionLoadingId === detailReport.id}
                    className={`h-8 px-2.5 text-xs cursor-pointer gap-1 ${
                      detailReport.status === 'approved'
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                    }`}
                  >
                    <Check className="size-3.5" />
                    Approve
                  </Button>

                  <Button
                    variant={detailReport.status === 'rejected' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleStatusChange(detailReport.id, 'rejected')}
                    disabled={actionLoadingId === detailReport.id}
                    className={`h-8 px-2.5 text-xs cursor-pointer gap-1 ${
                      detailReport.status === 'rejected'
                        ? 'bg-rose-600 hover:bg-rose-700 text-white'
                        : 'border-rose-300 text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                    }`}
                  >
                    <X className="size-3.5" />
                    Reject
                  </Button>
                </>
              )}
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDetailOpen(false)}
              className="cursor-pointer text-xs"
            >
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReportDashboard;
