'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Film, Lock, Globe, Tv, Sparkles, ArrowRight } from 'lucide-react';
import { YoutubeIcon } from '@/components/ui/Icons';
import { AppType, Room } from '@/types';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateRoomModal({ isOpen, onClose }: CreateRoomModalProps) {
  const router = useRouter();
  const { profile } = useSupabaseAuth();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [maxUsers, setMaxUsers] = useState(10);
  const [appType, setAppType] = useState<AppType>('youtube');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);

    const roomId = 'room-' + Math.random().toString(36).substring(2, 9);
    const defaultVideoId = appType === 'netflix' ? 'sBEvEcpnG7k' : 'aqz-KE-bpKQ';

    const newRoom: Room = {
      id: roomId,
      name: name.trim(),
      description: description.trim() || 'Birlikte izle ve sohbet et',
      owner_id: profile?.id || 'guest-owner',
      is_private: isPrivate,
      is_locked: false,
      max_users: maxUsers,
      app_type: appType,
      video_id: defaultVideoId,
      created_at: new Date().toISOString(),
      owner: profile || {
        id: 'guest-owner',
        username: 'Oda Sahibi',
        avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=owner',
      },
      active_count: 1,
    };

    // Save to Supabase if configured
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('rooms').insert({
          id: roomId,
          name: newRoom.name,
          description: newRoom.description,
          owner_id: profile?.id,
          is_private: newRoom.is_private,
          is_locked: false,
          max_users: newRoom.max_users,
          app_type: newRoom.app_type,
          video_id: newRoom.video_id,
        });
      } catch (err) {
        console.warn('Supabase insert failed, saving locally:', err);
      }
    }

    // Always save to localStorage for seamless fallback
    try {
      const stored = localStorage.getItem('watch_together_custom_rooms');
      const rooms: Room[] = stored ? JSON.parse(stored) : [];
      localStorage.setItem('watch_together_custom_rooms', JSON.stringify([newRoom, ...rooms]));
    } catch {
      // ignore
    }

    setIsSubmitting(false);
    onClose();
    router.push(`/room/${roomId}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#151821] border border-white/10 shadow-2xl p-6 sm:p-8 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
              <Film className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Yeni Oda Oluştur</h3>
              <p className="text-xs text-gray-400">Arkadaşlarınla video izleyip sesli sohbet et</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="pt-5 space-y-4">
          {/* Room Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Oda Adı <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Örn: Gece Sineması 🍿"
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#1C202B] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Oda Açıklaması
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Örn: Stranger Things yeni fragmanları izleyip sesli konuşuyoruz"
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#1C202B] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>

          {/* Starting Platform Selection */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Başlangıç İzleme Platformu
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div
                onClick={() => setAppType('youtube')}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  appType === 'youtube'
                    ? 'bg-red-500/10 border-red-500 ring-2 ring-red-500/20 text-white'
                    : 'bg-[#1C202B] border-white/[0.06] text-gray-400 hover:border-white/20'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white shrink-0">
                  <YoutubeIcon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">YouTube</p>
                  <p className="text-[10px] text-gray-400">Trend & Canlı Müzik</p>
                </div>
              </div>

              <div
                onClick={() => setAppType('netflix')}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  appType === 'netflix'
                    ? 'bg-red-950/40 border-[#E50914] ring-2 ring-[#E50914]/20 text-white'
                    : 'bg-[#1C202B] border-white/[0.06] text-gray-400 hover:border-white/20'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-[#E50914] flex items-center justify-center text-white shrink-0">
                  <Tv className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Netflix Sinema</p>
                  <p className="text-[10px] text-gray-400">Dizi & Film Partisi</p>
                </div>
              </div>
            </div>
          </div>

          {/* Room Type (Public / Private) */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div
              onClick={() => setIsPrivate(false)}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                !isPrivate
                  ? 'bg-violet-600/10 border-violet-500 text-white'
                  : 'bg-[#1C202B] border-white/[0.06] text-gray-400'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Globe className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white">Herkese Açık</span>
              </div>
              <p className="text-[10px] text-gray-400 leading-tight">
                Keşfet sayfasında listelenir, herkes katılabilir.
              </p>
            </div>

            <div
              onClick={() => setIsPrivate(true)}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                isPrivate
                  ? 'bg-violet-600/10 border-violet-500 text-white'
                  : 'bg-[#1C202B] border-white/[0.06] text-gray-400'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Lock className="w-4 h-4 text-violet-400" />
                <span className="text-xs font-bold text-white">Özel (Gizli)</span>
              </div>
              <p className="text-[10px] text-gray-400 leading-tight">
                Yalnızca davet linkine sahip olanlar katılabilir.
              </p>
            </div>
          </div>

          {/* Max Users Slider */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-gray-300">
                Maksimum Kullanıcı Sayısı
              </label>
              <span className="text-xs font-bold text-violet-400">{maxUsers} Kişi</span>
            </div>
            <input
              type="range"
              min="2"
              max="25"
              value={maxUsers}
              onChange={(e) => setMaxUsers(Number(e.target.value))}
              className="w-full accent-violet-600 bg-gray-700 h-1.5 rounded-lg cursor-pointer"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-sm shadow-xl shadow-violet-600/30 active:scale-95 transition-all"
            >
              <span>{isSubmitting ? 'Oda Hazırlanıyor...' : 'Odayı Başlat'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
