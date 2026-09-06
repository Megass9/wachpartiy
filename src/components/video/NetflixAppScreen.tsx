'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, Info, Tv, Film, Sparkles, Check, Volume2, VolumeX, SkipForward, MonitorPlay } from 'lucide-react';
import { CatalogItem } from '@/types';
import { NETFLIX_CATALOG } from '@/lib/mockData';

interface NetflixAppScreenProps {
  videoId: string;
  isPlaying: boolean;
  onVideoSelect: (videoId: string, title?: string) => void;
  onPlayStateChange: (playing: boolean) => void;
  onSeek: (seconds: number) => void;
  registerPlayer: (controls: {
    play: () => void;
    pause: () => void;
    seekTo: (seconds: number) => void;
    getCurrentTime: () => number;
  }) => void;
  onSwitchToScreenShare: () => void;
  isOwner: boolean;
}

export function NetflixAppScreen({
  videoId,
  isPlaying,
  onVideoSelect,
  onPlayStateChange,
  onSeek,
  registerPlayer,
  onSwitchToScreenShare,
  isOwner,
}: NetflixAppScreenProps) {
  const [activeItem, setActiveItem] = useState<CatalogItem>(
    NETFLIX_CATALOG.find((item) => item.videoId === videoId) || NETFLIX_CATALOG[0]
  );
  const [viewMode, setViewMode] = useState<'catalog' | 'player'>('player');
  const [isPlayerReady, setIsPlayerReady] = useState(false);

  const playerRef = useRef<any>(null);
  const internalSeekRef = useRef(false);

  // Load YouTube IFrame for trailer/stream playback
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
    }

    const initPlayer = () => {
      if (!window.YT || !window.YT.Player) return;

      if (playerRef.current) {
        playerRef.current.destroy();
      }

      playerRef.current = new window.YT.Player('netflix-player-container', {
        videoId: activeItem.videoId,
        playerVars: {
          autoplay: isPlaying ? 1 : 0,
          controls: 1,
          rel: 0,
          modestbranding: 1,
          enablejsapi: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: () => {
            setIsPlayerReady(true);
            registerPlayer({
              play: () => {
                if (playerRef.current?.playVideo) playerRef.current.playVideo();
              },
              pause: () => {
                if (playerRef.current?.pauseVideo) playerRef.current.pauseVideo();
              },
              seekTo: (seconds: number) => {
                if (playerRef.current?.seekTo) {
                  internalSeekRef.current = true;
                  playerRef.current.seekTo(seconds, true);
                  setTimeout(() => { internalSeekRef.current = false; }, 400);
                }
              },
              getCurrentTime: () => {
                return playerRef.current?.getCurrentTime ? playerRef.current.getCurrentTime() : 0;
              },
            });
          },
          onStateChange: (event: any) => {
            if (event.data === 1 && !internalSeekRef.current) {
              onPlayStateChange(true);
            } else if (event.data === 2 && !internalSeekRef.current) {
              onPlayStateChange(false);
            }
          },
        },
      });
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [activeItem.videoId]);

  const handleSelectItem = (item: CatalogItem) => {
    setActiveItem(item);
    onVideoSelect(item.videoId, item.title);
    setViewMode('player');
    if (playerRef.current?.loadVideoById) {
      playerRef.current.loadVideoById(item.videoId);
    }
  };

  const handleSkipIntro = () => {
    if (playerRef.current?.seekTo && playerRef.current?.getCurrentTime) {
      const current = playerRef.current.getCurrentTime();
      playerRef.current.seekTo(current + 85, true);
      onSeek(current + 85);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0B0D12] text-white">
      {/* Netflix Top Navigation Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/90 border-b border-white/[0.08] z-30">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-xl font-black tracking-tighter text-[#E50914] select-none">
              NETFLIX
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-[#E50914]/20 text-[#E50914] border border-[#E50914]/40">
              Party
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold">
            <button
              onClick={() => setViewMode('player')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'player'
                  ? 'bg-[#E50914] text-white shadow-lg shadow-red-600/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              🎬 Sinema Oynatıcı
            </button>
            <button
              onClick={() => setViewMode('catalog')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'catalog'
                  ? 'bg-[#E50914] text-white shadow-lg shadow-red-600/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              🍿 Netflix Kataloğu
            </button>
          </div>
        </div>

        {/* Live Tab Screen Share Option */}
        <button
          onClick={onSwitchToScreenShare}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-semibold text-white shadow-sm transition-colors"
          title="Kendi Netflix hesabınızı tarayıcı sekmesinden HD sesli olarak odaya aktarın"
        >
          <MonitorPlay className="w-4 h-4 text-violet-400" />
          <span>Netflix Sekmeni Paylaş</span>
        </button>
      </div>

      {/* Main Netflix Content */}
      <div className="relative flex-1 w-full overflow-hidden">
        {/* Cinema Video Player View */}
        <div className={`w-full h-full flex flex-col ${viewMode === 'player' ? 'block' : 'hidden'}`}>
          <div className="relative flex-1 w-full bg-black flex items-center justify-center">
            <div id="netflix-player-container" className="w-full h-full" />

            {/* Skip Intro Overlay Button */}
            <div className="absolute bottom-16 right-6 z-20">
              <button
                onClick={handleSkipIntro}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-black/80 hover:bg-black text-white text-xs font-bold border border-white/30 backdrop-blur-sm transition-all shadow-xl hover:scale-105 active:scale-95"
              >
                <SkipForward className="w-3.5 h-3.5 text-[#E50914]" />
                <span>İNTROYU ATLA</span>
              </button>
            </div>
          </div>

          {/* Currently Playing Netflix Title Bar */}
          <div className="px-5 py-3 bg-[#151821] border-t border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#E50914] flex items-center justify-center font-black text-white text-xs shadow-md shadow-[#E50914]/30">
                N
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  {activeItem.title}
                  <span className="text-[10px] text-emerald-400 font-semibold">{activeItem.rating}</span>
                </h3>
                <p className="text-xs text-gray-400">{activeItem.category} • {activeItem.year} • {activeItem.duration}</p>
              </div>
            </div>

            <button
              onClick={() => setViewMode('catalog')}
              className="text-xs font-semibold text-[#E50914] hover:underline"
            >
              Başka Dizi/Film Seç →
            </button>
          </div>
        </div>

        {/* Netflix Catalog View */}
        {viewMode === 'catalog' && (
          <div className="absolute inset-0 z-20 overflow-y-auto bg-[#0B0D12]">
            {/* Billboard Featured Item */}
            <div className="relative w-full h-[280px] sm:h-[340px] overflow-hidden">
              <img
                src={activeItem.bannerUrl || activeItem.thumbnail}
                alt={activeItem.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D12] via-[#0B0D12]/50 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0B0D12] via-transparent to-transparent" />

              <div className="absolute bottom-6 left-6 max-w-lg z-10">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-black text-[#E50914] tracking-widest uppercase">
                    NETFLIX ÖZEL
                  </span>
                  <span className="text-xs text-emerald-400 font-semibold">
                    {activeItem.rating}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
                  {activeItem.title}
                </h1>
                <p className="text-xs sm:text-sm text-gray-300 line-clamp-3 mb-4 leading-relaxed">
                  {activeItem.description}
                </p>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleSelectItem(activeItem)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-white/90 active:scale-95 transition-all shadow-xl"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Odayla Birlikte Oynat</span>
                  </button>
                  <button
                    onClick={() => {
                      setViewMode('player');
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-semibold text-xs backdrop-blur-md transition-all"
                  >
                    <Info className="w-4 h-4" />
                    <span>Oynatıcıya Geç</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Netflix Content Row */}
            <div className="px-6 py-6">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-[#E50914] rounded-full inline-block" />
                Netflix Popüler Yayınlar & Fragmanlar
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {NETFLIX_CATALOG.map((item) => {
                  const isCurrent = activeItem.id === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelectItem(item)}
                      className={`group relative rounded-xl overflow-hidden bg-[#151821] border transition-all duration-300 cursor-pointer hover:scale-105 hover:z-20 hover:shadow-2xl ${
                        isCurrent ? 'border-[#E50914] ring-2 ring-[#E50914]/30' : 'border-white/[0.08]'
                      }`}
                    >
                      <div className="aspect-[2/3] w-full relative">
                        <img
                          src={item.thumbnail}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2.5">
                          <div className="w-9 h-9 rounded-full bg-[#E50914] text-white flex items-center justify-center mb-2 mx-auto shadow-lg">
                            <Play className="w-4 h-4 fill-current ml-0.5" />
                          </div>
                          <p className="text-[11px] font-bold text-white text-center truncate">
                            {item.title}
                          </p>
                          <p className="text-[10px] text-emerald-400 text-center">
                            {item.rating}
                          </p>
                        </div>
                      </div>

                      <div className="p-2 bg-[#151821]">
                        <h4 className="text-xs font-semibold text-white truncate">{item.title}</h4>
                        <div className="flex items-center justify-between text-[10px] text-gray-400 mt-1">
                          <span>{item.duration}</span>
                          <span className="text-[#E50914] font-medium">{item.category.split(' ')[0]}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
