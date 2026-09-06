'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Copy, Check, Lock, Globe, Shield, Settings, Users, Sparkles } from 'lucide-react';
import { Room, AppType } from '@/types';
import { useToast } from '../ui/Toast';

interface RoomHeaderProps {
  room: Room;
  isOwner: boolean;
  memberCount: number;
  onOpenOwnerControls?: () => void;
  onOpenAppSelector?: () => void;
}

export function RoomHeader({
  room,
  isOwner,
  memberCount,
  onOpenOwnerControls,
  onOpenAppSelector,
}: RoomHeaderProps) {
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    showToast('Oda davet bağlantısı kopyalandı! Arkadaşlarına gönder 🍿', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-[#151821] border-b border-white/[0.08] z-20">
      {/* Left: Back & Room Info */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          title="Odadan Ayrıl / Dashboard"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-1.5">
              {room.name}
            </h1>

            {room.is_locked ? (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-semibold">
                <Lock className="w-3 h-3" /> Kilitli
              </span>
            ) : room.is_private ? (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-violet-500/10 border border-violet-500/20 text-violet-400 text-[10px] font-semibold">
                <Lock className="w-3 h-3" /> Özel
              </span>
            ) : (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-semibold">
                <Globe className="w-3 h-3" /> Herkese Açık
              </span>
            )}
          </div>

          <p className="text-[11px] text-gray-400 hidden sm:block truncate max-w-md">
            {room.description || 'Watch Together & Sesli Sohbet Odası'}
          </p>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Active Members Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1C202B] border border-white/[0.06] text-xs font-semibold text-gray-300">
          <Users className="w-3.5 h-3.5 text-violet-400" />
          <span>{memberCount}</span>
        </div>

        {/* Invite Link Button */}
        <button
          onClick={handleCopyLink}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-600/15 hover:bg-violet-600/25 border border-violet-500/30 text-violet-300 text-xs font-semibold transition-all active:scale-95"
          title="Davet bağlantısını kopyala"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{copied ? 'Kopyalandı!' : 'Davet Et'}</span>
        </button>

        {/* Owner Settings */}
        {isOwner && (
          <button
            onClick={onOpenOwnerControls}
            className="p-1.5 rounded-xl bg-[#1C202B] hover:bg-white/[0.08] text-gray-300 hover:text-white border border-white/[0.08] transition-colors"
            title="Oda Sahibi Ayarları"
          >
            <Settings className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
