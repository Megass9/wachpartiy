'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Film, Lock, Mail, User, ArrowRight, AlertCircle } from 'lucide-react';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

export default function RegisterPage() {
  const router = useRouter();
  const { signUpWithEmail } = useSupabaseAuth();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !email.trim() || !password) return;
    setError(null);
    setLoading(true);

    try {
      await signUpWithEmail(email, password, username.trim());
      router.push('/dashboard');
    } catch (err: unknown) {
      console.error('Registration error:', err);
      const msg = err instanceof Error ? err.message : 'Kayıt sırasında hata oluştu.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const avatarPreview = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(username || 'preview')}`;

  return (
    <div className="min-h-screen bg-[#0B0D12] flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-violet-600/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center shadow-xl shadow-violet-500/25 group-hover:scale-105 transition-transform">
              <Film className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tight text-white">
              Watch<span className="text-violet-400">Together</span>
            </span>
          </Link>
          <h2 className="text-xl font-bold text-white">Yeni Hesap Oluşturun</h2>
          <p className="text-xs text-gray-400 mt-1">Hemen katılın ve kendi odanızı yönetin</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-[#151821] border border-white/10 shadow-2xl p-6 sm:p-8">
          {error && (
            <div className="flex items-center gap-2 p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Avatar Preview */}
          <div className="flex flex-col items-center justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-violet-500/40 shadow-lg p-0.5 bg-violet-950/40">
              <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <span className="text-[11px] text-gray-400 mt-1.5 font-medium">Otomatik Bottts Profil Avatarı</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Kullanıcı Adı
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="KullanıcıAdınız"
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs sm:text-sm bg-[#1C202B] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors"
                />
                <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                E-posta Adresi
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ornek@mail.com"
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs sm:text-sm bg-[#1C202B] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors"
                />
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Şifre
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="En az 6 karakter"
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs sm:text-sm bg-[#1C202B] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors"
                />
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-xl shadow-violet-600/30 active:scale-95 transition-all"
            >
              <span>{loading ? 'Hesap Oluşturuluyor...' : 'Hesap Oluştur'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center mt-6">
            <p className="text-xs text-gray-400">
              Zaten hesabınız var mı?{' '}
              <Link href="/login" className="font-semibold text-violet-400 hover:underline">
                Giriş Yapın
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
