import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { UserPlus, Users, RefreshCw, Shield, User, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { apiFetch } from '@/lib/api';

interface UserItem {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'pelapor' | 'approver';
  created_at: string;
}

const UserManagement = () => {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'pelapor' | 'approver'>('pelapor');
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await apiFetch<UserItem[]>('/api/users');
      if (res.success && res.data) {
        setUsers(res.data);
      }
    } catch (err: any) {
      toast.error(err.message || 'Gagal memuat daftar pengguna');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      toast.error('Semua kolom wajib diisi');
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiFetch<UserItem>('/api/users', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, role }),
      });

      if (res.success && res.data) {
        toast.success(`Pengguna ${res.data.name} berhasil dibuat`);
        setName('');
        setEmail('');
        setPassword('');
        setRole('pelapor');
        setCreateOpen(false);
        fetchUsers();
      }
    } catch (err: any) {
      toast.error(err.message || 'Gagal membuat pengguna');
    } finally {
      setSubmitting(false);
    }
  };

  const renderRoleBadge = (userRole: UserItem['role']) => {
    switch (userRole) {
      case 'admin':
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800 gap-1">
            <Shield className="size-3" />
            Admin
          </Badge>
        );
      case 'approver':
        return (
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 gap-1">
            <CheckCircle className="size-3" />
            Approver
          </Badge>
        );
      case 'pelapor':
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800 gap-1">
            <User className="size-3" />
            Pelapor
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Users className="size-6 text-primary" />
            Kelola Pengguna
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manajemen akun pengguna sistem (Khusus Administrator). Akun dibuat terpusat tanpa registrasi mandiri.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchUsers} disabled={loading} className="cursor-pointer">
            <RefreshCw className={`size-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Muat Ulang
          </Button>

          <Button size="sm" onClick={() => setCreateOpen(true)} className="cursor-pointer">
            <UserPlus className="size-4 mr-1.5" />
            Tambah Pengguna
          </Button>
        </div>
      </div>

      <div className="border rounded-xl bg-card shadow-xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="w-16 text-center font-semibold">ID</TableHead>
              <TableHead className="font-semibold">Nama Lengkap</TableHead>
              <TableHead className="font-semibold">Email</TableHead>
              <TableHead className="w-32 text-center font-semibold">Peran (Role)</TableHead>
              <TableHead className="w-44 font-semibold">Terdaftar Pada</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="size-4 animate-spin" />
                    <span>Memuat daftar pengguna...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  Belum ada pengguna terdaftar.
                </TableCell>
              </TableRow>
            ) : (
              users.map((item) => (
                <TableRow key={item.id} className="hover:bg-muted/30">
                  <TableCell className="text-center font-mono text-xs text-muted-foreground">
                    #{item.id}
                  </TableCell>
                  <TableCell className="font-medium text-foreground">{item.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground font-mono">{item.email}</TableCell>
                  <TableCell className="text-center">{renderRoleBadge(item.role)}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(item.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal: Tambah Pengguna */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Buat Akun Pengguna Baru</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateUser} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Nama Lengkap</label>
              <Input
                placeholder="Contoh: Ahmad Teknisi"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                placeholder="nama@mapid.dev"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Role / Peran</label>
              <select
                className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
              >
                <option value="pelapor" className="bg-popover text-popover-foreground">Pelapor (Pembuat Laporan)</option>
                <option value="approver" className="bg-popover text-popover-foreground">Approver (Verifikasi & Persetujuan)</option>
                <option value="admin" className="bg-popover text-popover-foreground">Admin (Akses Penuh)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Kata Sandi</label>
              <Input
                type="password"
                placeholder="Minimal 6 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)} disabled={submitting}>
                Batal
              </Button>
              <Button type="submit" disabled={submitting} className="cursor-pointer">
                {submitting ? 'Menyimpan...' : 'Simpan Akun'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
