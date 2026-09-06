'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { CreateRoomModal } from '@/components/room/CreateRoomModal';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { Room } from '@/types';
import { SAMPLE_ROOMS } from '@/lib/mockData';
import {
  Compass,
  Plus,
  Search,
  Users,
  Tv,
  Lock,
  Globe,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { YoutubeIcon } from '@/components/ui/Icons';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

function DashboardContent() {
  const searchParams = useSearchParams();
  const { profile } = useSupabaseAuth();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'youtube' | 'netflix' | 'my'>('all');

  // Check URL params for create modal trigger
  useEffect(() => {
    if (searchParams.get('create') === 'true') {
      setCreateModalOpen(true);
    }
  }, [searchParams]);

  // Load Rooms
  useEffect(() => {
    async function loadRooms() {
      setLoading(true);

      let fetchedRooms: Room[] = [];

      if (isSupabaseConfigured()) {
        try {
          const { data, error } = await supabase
            .from('rooms')
            .select('*, owner:profiles(*)')
            .order('created_at', { ascending: false });

          if (!error && data) {
            fetchedRooms = data;
          }
        } catch (err) {
          console.warn('Could not fetch rooms from Supabase, loading local:', err);
        }
      }

      // Load local custom rooms
      let localCustom: Room[] = [];
      try {
        const stored = localStorage.getItem('watch_together_custom_rooms');
        if (stored) {
          localCustom = JSON.parse(stored);
        }
      } catch {
        // ignore
      }

      // Combine with sample rooms, avoiding duplicates
      const all = [...fetchedRooms, ...localCustom, ...SAMPLE_ROOMS];
      const unique = Array.from(new Map(all.map((item) => [item.id, item])).values());
      setRooms(unique);
      setLoading(false);
    }

    loadRooms();
  }, []);

  // Filter rooms
  const filteredRooms = rooms.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === 'youtube') return r.app_type === 'youtube';
    if (activeTab === 'netflix') return r.app_type === 'netflix';
    if (activeTab === 'my') return r.owner_id === profile?.id;
    return true;
  });

  return (
    <div className="flex flex-col min-h-screen bg-[#0B0D12] text-white">
      <Navbar onCreateRoomClick={() => setCreateModalOpen(true)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Banner Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-white/[0.08]">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <Compass className="w-6 h-6 text-violet-400" />
              Odaları Keşfet
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              Arkadaşlarının açtığı odalara katıl veya hemen yeni bir oda kur.
            </p>
          </div>

          <button
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-xl shadow-violet-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Oda Başlat</span>
          </button>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 my-6">
          {/* Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'all'
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-600/25'
                  : 'bg-[#151821] text-gray-400 hover:text-white border border-white/[0.06]'
              }`}
            >
              Tüm Odalar ({rooms.length})
            </button>
            <button
              onClick={() => setActiveTab('youtube')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'youtube'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/25'
                  : 'bg-[#151821] text-gray-400 hover:text-white border border-white/[0.06]'
              }`}
            >
              <YoutubeIcon className="w-3.5 h-3.5 text-red-500" />
              YouTube Odaları
            </button>
            <button
              onClick={() => setActiveTab('netflix')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'netflix'
                  ? 'bg-[#E50914] text-white shadow-md shadow-red-600/25'
                  : 'bg-[#151821] text-gray-400 hover:text-white border border-white/[0.06]'
              }`}
            >
              <Tv className="w-3.5 h-3.5 text-[#E50914]" />
              Netflix Odaları
            </button>
            {profile && (
              <button
                onClick={() => setActiveTab('my')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  activeTab === 'my'
                    ? 'bg-violet-600 text-white shadow-md shadow-violet-600/25'
                    : 'bg-[#151821] text-gray-400 hover:text-white border border-white/[0.06]'
                }`}
              >
                Benim Odalarım
              </button>
            )}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Oda ara..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-[#151821] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Room Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-64 rounded-2xl bg-[#151821] border border-white/[0.05]" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map((room) => (
              <Link
                key={room.id}
                href={`/room/${room.id}`}
                className="group flex flex-col rounded-2xl bg-[#151821] border border-white/[0.08] hover:border-violet-500/40 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
              >
                {/* Thumbnail Header */}
                <div className="aspect-video w-full relative bg-gray-900 overflow-hidden">
                  <img
                    src={
                      room.app_type === 'netflix'
                        ? 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?q=80&w=800&auto=format&fit=crop'
                        : 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop'
                    }
                    alt={room.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* App Type Badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-[11px] font-bold text-white">
                    {room.app_type === 'netflix' ? (
                      <span className="text-[#E50914] flex items-center gap-1">
                        <Tv className="w-3.5 h-3.5" /> Netflix
                      </span>
                    ) : (
                      <span className="text-red-400 flex items-center gap-1">
                        <YoutubeIcon className="w-3.5 h-3.5" /> YouTube
                      </span>
                    )}
                  </div>

                  {/* Privacy Badge */}
                  <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-[10px] font-bold text-gray-300">
                    {room.is_private ? (
                      <span className="flex items-center gap-1 text-violet-400">
                        <Lock className="w-3 h-3" /> Özel
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-emerald-400">
                        <Globe className="w-3 h-3" /> Herkese Açık
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col justify-between flex-1">
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-violet-300 transition-colors">
                      {room.name}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                      {room.description || 'Watch Together ve sesli sohbet odası.'}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-gray-400">
                    <div className="flex items-center gap-2">
                      <img
                        src={room.owner?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${room.owner_id}`}
                        alt="Owner"
                        className="w-5 h-5 rounded-md bg-violet-950/40"
                      />
                      <span className="text-[11px] text-gray-300 truncate max-w-[110px]">
                        {room.owner?.username || 'Oda Kurucusu'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-violet-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                      <span>Odaya Katıl</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {!loading && filteredRooms.length === 0 && (
          <div className="text-center py-16">
            <p className="text-sm text-gray-400">Kriterlerinize uygun aktif oda bulunamadı.</p>
            <button
              onClick={() => setCreateModalOpen(true)}
              className="mt-3 px-4 py-2 rounded-xl bg-violet-600 text-white text-xs font-semibold"
            >
              Hemen İlk Odayı Kur
            </button>
          </div>
        )}
      </main>

      <CreateRoomModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0B0D12]" />}>
      <DashboardContent />
    </Suspense>
  );
}
