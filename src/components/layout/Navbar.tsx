'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Film, Plus, Compass, User, LogOut, Sparkles } from 'lucide-react';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

interface NavbarProps {
  onCreateRoomClick?: () => void;
}

export function Navbar({ onCreateRoomClick }: NavbarProps) {
  const { profile, signOut } = useSupabaseAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-white/[0.07] bg-[#0B0D12]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-violet-500/25 group-hover:scale-105 transition-transform duration-300">
                <Film className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                  Watch<span className="text-violet-400">Together</span>
                  <span className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">
                    Live
                  </span>
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-1">
              <Link
                href="/dashboard"
                className="px-3.5 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/[0.05] rounded-lg transition-colors flex items-center gap-2"
              >
                <Compass className="w-4 h-4 text-violet-400" />
                Odaları Keşfet
              </Link>
              <Link
                href="/#features"
                className="px-3.5 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/[0.05] rounded-lg transition-colors flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                Özellikler
              </Link>
            </div>
          </div>

          {/* Right Action Buttons & User Profile */}
          <div className="flex items-center gap-3">
            {onCreateRoomClick ? (
              <button
                onClick={onCreateRoomClick}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 active:scale-95 rounded-xl shadow-lg shadow-violet-600/30 transition-all duration-200"
              >
                <Plus className="w-4 h-4" />
                <span>Oda Oluştur</span>
              </button>
            ) : (
              <Link
                href="/dashboard?create=true"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 active:scale-95 rounded-xl shadow-lg shadow-violet-600/30 transition-all duration-200"
              >
                <Plus className="w-4 h-4" />
                <span>Oda Oluştur</span>
              </Link>
            )}

            {profile ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl bg-[#151821] hover:bg-[#1C202B] border border-white/[0.07] transition-all"
                >
                  <img
                    src={profile.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${profile.username}`}
                    alt={profile.username}
                    className="w-7 h-7 rounded-lg bg-violet-950/50"
                  />
                  <span className="text-sm font-medium text-white max-w-[120px] truncate">
                    {profile.username}
                  </span>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl bg-[#1C202B] border border-white/10 shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-2 border-b border-white/[0.06]">
                      <p className="text-xs text-gray-400">Giriş yapıldı</p>
                      <p className="text-sm font-semibold text-white truncate">{profile.username}</p>
                    </div>
                    <Link
                      href="/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="w-full px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/[0.06] flex items-center gap-2 transition-colors"
                    >
                      <Compass className="w-4 h-4 text-violet-400" />
                      Odalarım & Keşfet
                    </Link>
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        signOut();
                      }}
                      className="w-full px-4 py-2 text-sm text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Çıkış Yap
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3.5 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/[0.05] rounded-xl transition-colors"
                >
                  Giriş Yap
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-white/10 hover:bg-white/15 rounded-xl border border-white/10 transition-colors"
                >
                  Kayıt Ol
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
