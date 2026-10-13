import { useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import logodark from '@/assets/images/logos/logoicon-dark.svg';

const AuthLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Email dan password wajib diisi');
      return;
    }

    setLoading(true);
    try {
      const res = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (res.success && res.data) {
        login(res.data.token, res.data.user);
        toast.success(`Selamat datang kembali, ${res.data.user.name}!`);
        navigate('/');
      } else {
        toast.error(res.message || 'Login gagal');
      }
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan saat login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 items-center">
      <a href="/">
        <img src={logodark} alt="Logo" width={44} height={44} className="dark:invert block" />
      </a>

      <div className="text-center flex flex-col gap-1">
        <h2 className="text-2xl font-bold text-foreground">Sistem Laporan Lapangan</h2>
        <p className="text-sm text-muted-foreground">Masuk untuk mengelola dan memverifikasi laporan</p>
      </div>

      <form className="space-y-4 w-full" onSubmit={handleSubmit}>
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-sm font-medium">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="nama@mapid.dev"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-sm font-medium">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <Button type="submit" size="lg" className="w-full rounded-lg cursor-pointer font-medium" disabled={loading}>
          {loading ? 'Memproses...' : 'Masuk ke Dashboard'}
        </Button>
      </form>
    </div>
  );
};

export default AuthLogin;
