import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  UserPlus,
  Users,
  RefreshCw,
  Shield,
  User,
  CheckCircle,
  Edit2,
  KeyRound,
  Trash2,
  AlertTriangle
} from 'lucide-react';
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
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';

interface UserItem {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'pelapor' | 'approver';
  created_at: string;
}

const UserManagement = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal 1: Create User
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'pelapor' | 'approver'>('pelapor');
  const [submitting, setSubmitting] = useState(false);

  // Modal 2: Edit User
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState<'admin' | 'pelapor' | 'approver'>('pelapor');
  const [submittingEdit, setSubmittingEdit] = useState(false);

  // Modal 3: Change Password
  const [passOpen, setPassOpen] = useState(false);
  const [passId, setPassId] = useState<number | null>(null);
  const [passUserName, setPassUserName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submittingPass, setSubmittingPass] = useState(false);

  // Modal 4: Delete User (Soft Delete)
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<UserItem | null>(null);
  const [submittingDelete, setSubmittingDelete] = useState(false);

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

  const openEditModal = (item: UserItem) => {
    setEditId(item.id);
    setEditName(item.name);
    setEditEmail(item.email);
    setEditRole(item.role);
    setEditOpen(true);
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim() || !editEmail.trim() || !editId) {
      toast.error('Nama dan email wajib diisi');
      return;
    }

    setSubmittingEdit(true);
    try {
      const res = await apiFetch<UserItem>(`/api/users/${editId}`, {
        method: 'PUT',
        body: JSON.stringify({ name: editName, email: editEmail, role: editRole }),
      });

      if (res.success && res.data) {
        toast.success(`Data pengguna ${res.data.name} berhasil diperbarui`);
        setEditOpen(false);
        fetchUsers();
      }
    } catch (err: any) {
      toast.error(err.message || 'Gagal memperbarui pengguna');
    } finally {
      setSubmittingEdit(false);
    }
  };

  const openPassModal = (item: UserItem) => {
    setPassId(item.id);
    setPassUserName(item.name);
    setNewPassword('');
    setConfirmPassword('');
    setPassOpen(true);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      toast.error('Kata sandi baru dan konfirmasi wajib diisi');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Kata sandi minimal 6 karakter');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Konfirmasi kata sandi tidak cocok');
      return;
    }

    setSubmittingPass(true);
    try {
      const res = await apiFetch(`/api/users/${passId}/password`, {
        method: 'PATCH',
        body: JSON.stringify({ newPassword, confirmPassword }),
      });

      if (res.success) {
        toast.success(`Kata sandi untuk ${passUserName} berhasil diperbarui`);
        setPassOpen(false);
      }
    } catch (err: any) {
      toast.error(err.message || 'Gagal mengubah kata sandi');
    } finally {
      setSubmittingPass(false);
    }
  };

  const openDeleteModal = (item: UserItem) => {
    setDeleteItem(item);
    setDeleteOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!deleteItem) return;

    setSubmittingDelete(true);
    try {
      const res = await apiFetch(`/api/users/${deleteItem.id}`, {
        method: 'DELETE',
      });

      if (res.success) {
        toast.success(`Pengguna ${deleteItem.name} berhasil dihapus`);
        setDeleteOpen(false);
        fetchUsers();
      }
    } catch (err: any) {
      toast.error(err.message || 'Gagal menghapus pengguna');
    } finally {
      setSubmittingDelete(false);
    }
  };

  const renderRoleBadge = (userRole: UserItem['role']) => {
    switch (userRole) {
      case 'admin':
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800 gap-1 text-xs">
            <Shield className="size-3" />
            Admin
          </Badge>
        );
      case 'approver':
        return (
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 gap-1 text-xs">
            <CheckCircle className="size-3" />
            Approver
          </Badge>
        );
      case 'pelapor':
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800 gap-1 text-xs">
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
              <TableHead className="w-14 text-center font-semibold">ID</TableHead>
              <TableHead className="font-semibold">Nama Lengkap</TableHead>
              <TableHead className="font-semibold">Email</TableHead>
              <TableHead className="w-32 text-center font-semibold">Peran (Role)</TableHead>
              <TableHead className="w-40 font-semibold">Terdaftar Pada</TableHead>
              <TableHead className="w-60 text-right font-semibold">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="size-4 animate-spin" />
                    <span>Memuat daftar pengguna...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
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
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Tombol Edit */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditModal(item)}
                        className="h-7 px-2 text-xs cursor-pointer gap-1"
                      >
                        <Edit2 className="size-3 text-muted-foreground" />
                        Edit
                      </Button>

                      {/* Tombol Change Password */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openPassModal(item)}
                        className="h-7 px-2 text-xs cursor-pointer gap-1"
                      >
                        <KeyRound className="size-3 text-amber-500" />
                        Password
                      </Button>

                      {/* Tombol Delete (Soft Delete) */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDeleteModal(item)}
                        disabled={currentUser?.id === item.id}
                        title={currentUser?.id === item.id ? 'Tidak dapat menghapus akun sendiri' : 'Hapus pengguna'}
                        className="h-7 px-2 text-xs cursor-pointer gap-1 text-rose-600 border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/40 disabled:opacity-40"
                      >
                        <Trash2 className="size-3" />
                        Hapus
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal 1: Tambah Pengguna */}
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

      {/* Modal 2: Edit Pengguna */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Pengguna #{editId}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditUser} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Nama Lengkap</label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Role / Peran</label>
              <select
                className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                value={editRole}
                onChange={(e) => setEditRole(e.target.value as any)}
              >
                <option value="pelapor" className="bg-popover text-popover-foreground">Pelapor (Pembuat Laporan)</option>
                <option value="approver" className="bg-popover text-popover-foreground">Approver (Verifikasi & Persetujuan)</option>
                <option value="admin" className="bg-popover text-popover-foreground">Admin (Akses Penuh)</option>
              </select>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)} disabled={submittingEdit}>
                Batal
              </Button>
              <Button type="submit" disabled={submittingEdit} className="cursor-pointer">
                {submittingEdit ? 'Menyimpan...' : 'Perbarui Pengguna'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal 3: Change Password */}
      <Dialog open={passOpen} onOpenChange={setPassOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="size-4 text-amber-500" />
              <span>Ubah Kata Sandi: {passUserName}</span>
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleChangePassword} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Kata Sandi Baru</label>
              <Input
                type="password"
                placeholder="Minimal 6 karakter"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Konfirmasi Kata Sandi Baru</label>
              <Input
                type="password"
                placeholder="Ulangi kata sandi baru"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-xs text-rose-500 font-medium">Konfirmasi kata sandi tidak cocok</p>
              )}
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setPassOpen(false)} disabled={submittingPass}>
                Batal
              </Button>
              <Button
                type="submit"
                disabled={submittingPass || (Boolean(confirmPassword) && newPassword !== confirmPassword)}
                className="cursor-pointer"
              >
                {submittingPass ? 'Menyimpan...' : 'Perbarui Password'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal 4: Konfirmasi Soft Delete */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-600">
              <AlertTriangle className="size-5" />
              <span>Hapus Pengguna</span>
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-2 text-sm">
            <p className="text-foreground">
              Apakah Anda yakin ingin menghapus pengguna <strong className="font-semibold text-foreground">{deleteItem?.name}</strong> ({deleteItem?.email})?
            </p>
            <p className="text-xs text-muted-foreground bg-muted/40 p-2.5 rounded-lg border">
              Akun ini akan dinonaktifkan (<strong>soft delete</strong>). Pengguna tidak dapat lagi masuk ke sistem, namun riwayat laporan lapangan yang pernah dibuat tetap tersimpan dengan aman.
            </p>
          </div>
          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => setDeleteOpen(false)} disabled={submittingDelete}>
              Batal
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteUser}
              disabled={submittingDelete}
              className="cursor-pointer"
            >
              {submittingDelete ? 'Menghapus...' : 'Ya, Hapus Pengguna'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
