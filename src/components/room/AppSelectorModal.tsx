'use client';

import React from 'react';
import { X, MonitorPlay, Tv, Sparkles, Check, ArrowRight } from 'lucide-react';
import { YoutubeIcon } from '@/components/ui/Icons';
import { AppType } from '@/types';

interface AppSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentApp: AppType;
  onSelectApp: (app: AppType) => void;
}

export function AppSelectorModal({
  isOpen,
  onClose,
  currentApp,
  onSelectApp,
}: AppSelectorModalProps) {
  if (!isOpen) return null;

  const apps = [
    {
      id: 'youtube' as AppType,
      title: 'YouTube',
      subtitle: 'Trendler, Müzik & Canlı Arama',
      description: 'Bağlantı kopyalamaya gerek yok! Trend videoları, müzikleri ve istediğiniz içerikleri dahili YouTube ekranından tek tıkla seçip başlatın.',
      badge: 'En Popüler',
      badgeColor: 'bg-red-500/20 text-red-400 border-red-500/30',
      icon: YoutubeIcon,
      color: 'from-red-600 to-rose-600',
      borderHover: 'hover:border-red-500/50',
      activeBorder: 'border-red-500 ring-2 ring-red-500/20',
      tag: 'Senkron Oynatma',
    },
    {
      id: 'netflix' as AppType,
      title: 'Netflix Sinema',
      subtitle: 'Özel Dizi & Film Kataloğu',
      description: 'Netflix arayüzü ile Stranger Things, Black Mirror, Squid Game gibi popüler dizi/filmleri ve fragmanları kırmızı sinema modunda birlikte izleyin.',
      badge: 'Sinema Modu',
      badgeColor: 'bg-[#E50914]/20 text-[#E50914] border-[#E50914]/30',
      icon: Tv,
      color: 'from-[#E50914] to-red-900',
      borderHover: 'hover:border-[#E50914]/50',
      activeBorder: 'border-[#E50914] ring-2 ring-[#E50914]/20',
      tag: 'Netflix Arayüzü',
    },
    {
      id: 'screenshare' as AppType,
      title: 'Canlı Ekran & Netflix Yayını',
      subtitle: 'Kendi Netflix Sekmeni Paylaş',
      description: 'Netflix hesabınızı tarayıcı sekmesinden odaya doğrudan HD sesli yayınlayın. DRM kısıtlamalarına takılmadan dilediğiniz her şeyi izleyin.',
      badge: 'Ultra HD',
      badgeColor: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
      icon: MonitorPlay,
      color: 'from-violet-600 to-indigo-600',
      borderHover: 'hover:border-violet-500/50',
      activeBorder: 'border-violet-500 ring-2 ring-violet-500/20',
      tag: 'WebRTC HD Stream',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl rounded-2xl bg-[#151821] border border-white/10 shadow-2xl p-6 sm:p-8 overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="relative flex items-center justify-between pb-6 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                İzleme Uygulamasını Seçin
              </h2>
              <p className="text-xs sm:text-sm text-gray-400">
                Oda içerisinde izlemek istediğiniz platformu belirleyin.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* App Choices Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
          {apps.map((app) => {
            const isSelected = currentApp === app.id;
            const Icon = app.icon;

            return (
              <div
                key={app.id}
                onClick={() => {
                  onSelectApp(app.id);
                  onClose();
                }}
                className={`group relative flex flex-col justify-between p-5 rounded-xl bg-[#1C202B]/90 border transition-all duration-300 cursor-pointer ${
                  isSelected ? app.activeBorder : `border-white/[0.08] ${app.borderHover}`
                } hover:translate-y-[-2px] hover:shadow-xl`}
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${app.color} flex items-center justify-center shadow-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${app.badgeColor}`}>
                      {app.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-violet-300 transition-colors flex items-center gap-1.5">
                    {app.title}
                  </h3>
                  <p className="text-xs text-gray-400 font-medium mb-2">{app.subtitle}</p>
                  <p className="text-xs text-gray-400/90 leading-relaxed">
                    {app.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-white/[0.06] flex items-center justify-between">
                  <span className="text-[11px] text-gray-500 font-medium">{app.tag}</span>
                  {isSelected ? (
                    <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400">
                      <Check className="w-4 h-4" /> Seçili
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-semibold text-violet-400 group-hover:translate-x-1 transition-transform">
                      Seç <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center pt-2">
          <p className="text-xs text-gray-500">
            💡 Seçtiğiniz uygulama odadaki tüm kullanıcıların ekranına anında ve senkronize yansır.
          </p>
        </div>
      </div>
    </div>
  );
}
