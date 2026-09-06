'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { CreateRoomModal } from '@/components/room/CreateRoomModal';
import {
  Film,
  Mic,
  MessageSquare,
  Users,
  Compass,
  Play,
  Tv,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { YoutubeIcon } from '@/components/ui/Icons';
import { SAMPLE_ROOMS } from '@/lib/mockData';

export default function LandingPage() {
  const [createModalOpen, setCreateModalOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-[#0B0D12] text-white selection:bg-violet-600">
      <Navbar onCreateRoomClick={() => setCreateModalOpen(true)} />

      {/* Hero Section */}
      <section className="relative pt-16 pb-24 lg:pt-28 lg:pb-36 overflow-hidden">
        {/* Background Gradients & Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-violet-600/20 via-purple-600/15 to-transparent rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-red-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-semibold mb-8 animate-in fade-in duration-500">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span>Yeni Nesil Senkronize Video & WebRTC Sesli Sohbet</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-4xl mx-auto leading-[1.1] mb-6">
            Birlikte İzle, <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-violet-400 via-purple-300 to-indigo-400 bg-clip-text text-transparent">
              Birlikte Konuş.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            Arkadaşlarınla aynı odada buluş. Sesli konuş, sohbet et ve favori videolarını senkronize şekilde birlikte izle.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button
              onClick={() => setCreateModalOpen(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-violet-600/30 hover:shadow-violet-600/50 hover:scale-105 active:scale-95 transition-all duration-200"
            >
              <Film className="w-4 h-4" />
              <span>Oda Oluştur</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <Link
              href="/dashboard"
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-[#151821] hover:bg-[#1C202B] text-white font-semibold text-sm border border-white/10 hover:border-white/20 active:scale-95 transition-all duration-200"
            >
              <Compass className="w-4 h-4 text-violet-400" />
              <span>Odaları Keşfet</span>
            </Link>
          </div>

          {/* In-Room Apps Showcase Pills */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-red-600/10 border border-red-500/20 text-xs font-semibold text-red-300">
              <YoutubeIcon className="w-4 h-4 text-red-500" />
              <span>Entegre YouTube Ekranı</span>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#E50914]/10 border border-[#E50914]/30 text-xs font-semibold text-red-400">
              <Tv className="w-4 h-4 text-[#E50914]" />
              <span>Netflix Sinema & Sekme Yayını</span>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-300">
              <Mic className="w-4 h-4 text-emerald-400" />
              <span>Gecikmesiz WebRTC Sesli Sohbet</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section id="features" className="py-20 bg-[#0B0D12] relative border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Eğlenceyi Arkadaşlarınla Canlı Paylaş
            </h2>
            <p className="text-sm text-gray-400 mt-2">
              Uzaklıklar video izleme ve sohbet etme keyfinize engel olmasın.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-[#151821] border border-white/[0.08] hover:border-violet-500/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
              <div className="w-12 h-12 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center mb-5 text-violet-400">
                <Film className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">🎬 Birlikte İzle</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Videoyu durdurduğunuzda, başlattığınızda veya ileri sardığınızda odadaki herkes aynı saniyede kalır. 5 saniyede bir drift kontrolü ile senkronizasyon hiç bozulmaz.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-[#151821] border border-white/[0.08] hover:border-emerald-500/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
              <div className="w-12 h-12 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center mb-5 text-emerald-400">
                <Mic className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">🎙️ Sesli Sohbet</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                WebRTC mesh mimarisi ile sıfır gecikmeli sesli konuşma. Kimin konuştuğunu gösteren Discord tarzı parlayan yeşil halka göstergeleri.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-[#151821] border border-white/[0.08] hover:border-indigo-500/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
              <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mb-5 text-indigo-400">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">💬 Canlı Mesajlaşma</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Sesini açmak istemeyenler için hızlı ve canlı metin sohbeti. Emojiler, yazıyor bildirimleri ve anlık akıcı animasyonlar.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-[#151821] border border-white/[0.08] hover:border-amber-500/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
              <div className="w-12 h-12 rounded-xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center mb-5 text-amber-400">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">👥 Arkadaşlarınla Buluş</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Tek bir link ile özel veya genel odalara anında davet et. Kayıt olma zorunluluğu olmadan dahi anında izlemeye başla.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Explore Active Rooms Preview */}
      <section className="py-16 bg-[#0B0D12]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">Canlı Odalar</h2>
              <p className="text-xs text-gray-400">Şu anda aktif olan topluluk ve sinema odaları</p>
            </div>
            <Link
              href="/dashboard"
              className="text-xs font-semibold text-violet-400 hover:text-violet-300 flex items-center gap-1"
            >
              Tüm Odaları Gör <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SAMPLE_ROOMS.map((room) => (
              <Link
                key={room.id}
                href={`/room/${room.id}`}
                className="group flex flex-col rounded-2xl bg-[#151821] border border-white/[0.08] hover:border-violet-500/40 overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
              >
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
                  <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/80 backdrop-blur-md text-[11px] font-bold text-white">
                    <Users className="w-3 h-3" />
                    <span>{room.active_count} Aktif</span>
                  </div>
                </div>

                <div className="p-4 flex flex-col justify-between flex-1">
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-violet-300 transition-colors">
                      {room.name}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">{room.description}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-gray-400">
                    <div className="flex items-center gap-2">
                      <img
                        src={room.owner?.avatar_url}
                        alt="Owner"
                        className="w-5 h-5 rounded-md bg-violet-950/40"
                      />
                      <span className="text-[11px] truncate max-w-[100px]">{room.owner?.username}</span>
                    </div>
                    <span className="text-violet-400 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                      Katıl <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 border-t border-white/[0.06] bg-[#0B0D12] text-center text-xs text-gray-500">
        <p>© 2026 WatchTogether. Tüm hakları saklıdır. Supabase, WebRTC ve Next.js ile geliştirildi.</p>
      </footer>

      {/* Modal */}
      <CreateRoomModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />
    </div>
  );
}
