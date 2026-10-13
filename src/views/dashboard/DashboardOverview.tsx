import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Users,
  AlertTriangle,
  ArrowRight,
  Plus,
  RefreshCw,
  ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';

interface SummaryData {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  totalUsers?: number;
}

interface ReportItem {
  id: number;
  nama: string;
  deskripsi: string;
  status: 'pending' | 'approved' | 'rejected';
  reporter_name: string;
  reviewer_name: string | null;
  reviewed_at: string | null;
  created_at: string;
}

const DashboardOverview = () => {
  const { isAdmin, isApprover, isPelapor } = useAuth();
  const navigate = useNavigate();

  const [summary, setSummary] = useState<SummaryData>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    totalUsers: 0,
  });
  const [recentReports, setRecentReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sumRes, repRes] = await Promise.all([
        apiFetch<SummaryData>('/api/reports/summary'),
        apiFetch<ReportItem[]>('/api/reports'),
      ]);

      if (sumRes.success && sumRes.data) {
        setSummary(sumRes.data);
      }
      if (repRes.success && repRes.data) {
        setRecentReports(repRes.data);
      }
    } catch {
      // Handled silently or with defaults
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const renderStatusBadge = (status: ReportItem['status']) => {
    switch (status) {
      case 'approved':
        return (
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs">
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="outline" className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 text-xs">
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-xs">
            Pending
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Dashboard Summary
            </h1>
            <Badge variant="secondary" className="font-medium text-xs">
              {isAdmin ? 'Administrator' : isApprover ? 'Approver' : 'Pelapor'}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {isPelapor
              ? 'Ringkasan data laporan lapangan yang telah Anda ajukan.'
              : 'Ringkasan pemantauan dan persetujuan laporan lapangan secara menyeluruh.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            disabled={loading}
            className="cursor-pointer gap-1.5"
          >
            <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          {isPelapor && (
            <Button
              size="sm"
              onClick={() => navigate('/reports')}
              className="cursor-pointer gap-1.5 bg-primary text-primary-foreground font-medium"
            >
              <Plus className="size-4" />
              Buat Laporan
            </Button>
          )}

          {(isApprover || isAdmin) && (
            <Button
              size="sm"
              onClick={() => navigate('/reports')}
              className="cursor-pointer gap-1.5 bg-primary text-primary-foreground font-medium"
            >
              <FileText className="size-4" />
              Kelola Laporan
            </Button>
          )}
        </div>
      </div>

      {/* Special Attention Banner for Approver & Admin */}
      {(isApprover || isAdmin) && (
        summary.pending > 0 ? (
          <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
                <AlertTriangle className="size-5" />
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">
                  Perhatian: Ada {summary.pending} laporan yang belum disetujui
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Laporan pending memerlukan tinjauan dan keputusan persetujuan dari tim Approver / Admin.
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant="default"
              onClick={() => navigate('/reports')}
              className="shrink-0 bg-amber-600 hover:bg-amber-700 text-white cursor-pointer gap-1 text-xs"
            >
              Tinjau Laporan Sekarang
              <ArrowRight className="size-3.5" />
            </Button>
          </div>
        ) : (
          <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 shrink-0">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground">
                Semua Laporan Terverifikasi
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Tidak ada laporan lapangan yang berstatus pending saat ini.
              </p>
            </div>
          </div>
        )
      )}

      {/* Summary Cards */}
      <div className={`grid grid-cols-2 ${isAdmin ? 'lg:grid-cols-5' : 'lg:grid-cols-4'} gap-4`}>
        {/* Total Reports */}
        <div className="p-4 rounded-xl border bg-card shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">
              {isPelapor ? 'Laporan Saya' : 'Total Laporan'}
            </span>
            <FileText className="size-4 text-primary" />
          </div>
          <p className="text-2xl font-bold mt-2 text-foreground">{summary.total}</p>
          <span className="text-xs text-muted-foreground mt-1 block">
            {isPelapor ? 'Diajukan oleh Anda' : 'Seluruh tim lapangan'}
          </span>
        </div>

        {/* Pending Reports */}
        <div className="p-4 rounded-xl border bg-card shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Pending</span>
            <Clock className="size-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold mt-2 text-amber-600 dark:text-amber-400">
            {summary.pending}
          </p>
          <span className="text-xs text-muted-foreground mt-1 block">
            {summary.pending > 0 && (isApprover || isAdmin)
              ? 'Membutuhkan persetujuan'
              : 'Menunggu review'}
          </span>
        </div>

        {/* Approved Reports */}
        <div className="p-4 rounded-xl border bg-card shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Approved</span>
            <CheckCircle2 className="size-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold mt-2 text-emerald-600 dark:text-emerald-400">
            {summary.approved}
          </p>
          <span className="text-xs text-muted-foreground mt-1 block">
            Telah diverifikasi
          </span>
        </div>

        {/* Rejected Reports */}
        <div className="p-4 rounded-xl border bg-card shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Rejected</span>
            <XCircle className="size-4 text-rose-500" />
          </div>
          <p className="text-2xl font-bold mt-2 text-rose-600 dark:text-rose-400">
            {summary.rejected}
          </p>
          <span className="text-xs text-muted-foreground mt-1 block">
            Ditolak / revisi
          </span>
        </div>

        {/* Total Users (Admin Only) */}
        {isAdmin && (
          <div className="p-4 rounded-xl border bg-card shadow-xs col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">Pengguna</span>
              <Users className="size-4 text-indigo-500" />
            </div>
            <p className="text-2xl font-bold mt-2 text-foreground">
              {summary.totalUsers || 0}
            </p>
            <span className="text-xs text-muted-foreground mt-1 block">
              Akun terdaftar
            </span>
          </div>
        )}
      </div>

      {/* Recent Reports Table */}
      <div className="border rounded-xl bg-card shadow-xs overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-foreground text-sm">
              {isPelapor
                ? 'Laporan Terbaru Anda'
                : (isApprover || isAdmin) && summary.pending > 0
                ? 'Laporan yang Memerlukan Tindakan'
                : 'Laporan Terbaru'}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isPelapor
                ? 'Daftar riwayat laporan lapangan yang baru dibuat.'
                : 'Pantau laporan yang masuk untuk peninjauan berkala.'}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/reports')}
            className="text-xs gap-1 cursor-pointer"
          >
            Lihat Semua Laporan
            <ArrowRight className="size-3" />
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="w-14 text-center font-semibold">ID</TableHead>
              <TableHead className="font-semibold">Nama Laporan</TableHead>
              {!isPelapor && <TableHead className="font-semibold w-36">Pelapor</TableHead>}
              <TableHead className="font-semibold w-28 text-center">Status</TableHead>
              <TableHead className="font-semibold w-36">Waktu Dibuat</TableHead>
              <TableHead className="w-24 text-right font-semibold">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={isPelapor ? 5 : 6} className="h-24 text-center text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="size-4 animate-spin" />
                    <span>Memuat data...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : recentReports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isPelapor ? 5 : 6} className="h-24 text-center text-muted-foreground">
                  Belum ada laporan yang diajukan.
                </TableCell>
              </TableRow>
            ) : (
              recentReports.slice(0, 5).map((rep) => (
                <TableRow key={rep.id} className="hover:bg-muted/30">
                  <TableCell className="text-center font-mono text-xs text-muted-foreground">
                    #{rep.id}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-foreground">{rep.nama}</div>
                    <div className="text-xs text-muted-foreground line-clamp-1">{rep.deskripsi}</div>
                  </TableCell>
                  {!isPelapor && (
                    <TableCell className="text-sm font-medium text-foreground">
                      {rep.reporter_name}
                    </TableCell>
                  )}
                  <TableCell className="text-center">
                    {renderStatusBadge(rep.status)}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(rep.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate('/reports')}
                      className="h-7 px-2 text-xs cursor-pointer"
                    >
                      Buka
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default DashboardOverview;
